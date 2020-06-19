import {StateBuilder} from "./stateBuilder";
import {AwaitOperation} from "./operations/awaitOperation";
import {SendMessageOperation} from "./operations/sendMessageOperation";
import {GotoOperation} from "./operations/gotoOperation";
import {AwaitWithIgnoreOperation} from "./operations/awaitWithIgnoreOperation";
import {AwaitWithRetryOperation} from "./operations/awaitWithRetryOperation";
import {SendResultOperation} from "./operations/sendResultOperation";
import {PipeEventOperation} from "./operations/pipeEventOperation";
import {PipeResultOperation} from "./operations/pipeResultOperation";
import {CloseOperation} from "./operations/closeOperation";
import {Operation} from "./operations/operation";
import {RuntimeTrigger} from "./runtime/runtimeTrigger";
import {RuntimeState} from "./runtime/runtimeState";
import {StayOperation} from "./operations/stayOperation";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class DialogBuilder<
    TStates extends string,
    TContext extends IDialogContext
    >
{
    readonly _states: { [name: string]: StateBuilder<TStates, TContext> } = {};

    when(state: TStates): StateBuilder<TStates, TContext>
    {
        if (this._states[state])
        {
            throw new Error("when(state: '" + state + "') was already called before.");
        }
        this._states[state] = new StateBuilder(this, state);
        return this._states[state];
    }

    build()
    {
        const runtimeStates:RuntimeState<TStates, TContext>[] = [];

        for (let stateName in this._states)
        {
            const state = this._states[stateName];
            const triggers = this._getTriggerChainFromState(state);

            const runtimeTriggers:RuntimeTrigger<TStates, TContext>[] = triggers.map(triggerChain =>
            {
                const triggerOperations:Operation<TContext>[] = triggerChain.chain.map(trigger =>
                {
                    if (trigger.closeFlag) {
                        return new CloseOperation();
                    }
                    else if (trigger.stayFlag) {
                        return new StayOperation();
                    }
                    else if (trigger.pipeEventFlag && trigger.nextState) {
                        return new PipeEventOperation(trigger.nextState);
                    }
                    else if (trigger.pipeResultFlag && trigger.nextState) {
                        return new PipeResultOperation(trigger.nextState);
                    }
                    else if (trigger.sendResultFlag) {
                        return new SendResultOperation();
                    }
                    else if (trigger.awaitPromise && trigger.onErrorRetryCount) {
                        return new AwaitWithRetryOperation(trigger.awaitPromise, trigger.onErrorRetryCount);
                    }
                    else if (trigger.awaitPromise && trigger.onErrorIgnoreFlag) {
                        return new AwaitWithIgnoreOperation(trigger.awaitPromise);
                    }
                    else if (trigger.awaitPromise) {
                        return new AwaitOperation(trigger.awaitPromise);
                    }
                    else if (trigger.sendMessageFactory) {
                        return new SendMessageOperation(trigger.sendMessageFactory);
                    }
                    else if (trigger.nextState) {
                        return new GotoOperation(trigger.nextState);
                    }
                    else {
                        throw new Error("The _Trigger is in an undefined state");
                    }
                });

                return new RuntimeTrigger<TStates, TContext>(
                    triggerChain.root,
                    triggerChain.chain,
                    triggerOperations);
            });

            const runtimeState = new RuntimeState(stateName, runtimeTriggers);
            runtimeStates.push(runtimeState);
        }

        return runtimeStates;
    }

    private _getTriggerChainFromState(state:StateBuilder<TStates, TContext>)
    {
        const leafTriggers = state.triggers.filter(o => state.triggers.filter(p => p.previousTrigger == o).length == 0);

        const triggerChain = leafTriggers.map(trigger =>
        {
            const chain = [trigger];
            let previous = trigger.previousTrigger;
            while (previous)
            {
                chain.push(previous);
                previous = previous.previousTrigger;
            }

            return {
                root: chain[chain.length-1],
                chain: chain.reverse()
            };
        });

        return triggerChain;
    }
}