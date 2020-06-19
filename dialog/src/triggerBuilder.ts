import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {StateBuilder} from "./stateBuilder";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class TriggerBuilder<
    TStates extends string,
    TContext extends IDialogContext,
    TEvent extends SchemaType,
    TResult extends SchemaType
    >
{
    private readonly _parent:StateBuilder<TStates, TContext>;

    readonly eventType:SchemaTypes;
    readonly filter?:(e:TEvent) => boolean;
    readonly log?:(ctx:TContext, e:TEvent) => void;

    readonly previousTrigger?: TriggerBuilder<TStates, TContext, TEvent, SchemaType>;

    closeFlag?:boolean;
    pipeEventFlag?:boolean;
    pipeResultFlag?:boolean;
    sendResultFlag?:boolean;
    stayFlag?: boolean;
    onErrorIgnoreFlag?:boolean;
    onErrorRetryFlag?:boolean;
    onErrorRetryCount?:number;
    nextState?:TStates;

    awaitPromise?:(context:TContext, event:TEvent) => Promise<SchemaType>;
    sendMessageFactory?:(context:TContext, event:TEvent, result:TResult) => Promise<SchemaType>;


    get name(): string
    {
        if (this.closeFlag) {
            return this.eventType + "->close()"
        }
        else if (this.stayFlag) {
            return this.eventType + "->stay()"
        }
        else if (this.pipeEventFlag && this.nextState) {
            return this.eventType + "->pipeEventTo('" + this.nextState + "')";
        }
        else if (this.pipeResultFlag && this.nextState) {
            return this.eventType + "->pipeResultTo('" + this.nextState + "')";
        }
        else if (this.sendResultFlag) {
            return this.eventType + "->sendResult()"
        }
        else if (this.awaitPromise && this.onErrorRetryCount) {
            return this.eventType + "->await()->onErrorRetry()]"
        }
        else if (this.awaitPromise && this.onErrorIgnoreFlag) {
            return this.eventType + "->await()->onErrorIgnore()]"
        }
        else if (this.awaitPromise) {
            return this.eventType + "->await()"
        }
        else if (this.sendMessageFactory) {
            return this.eventType + "->send()"
        }
        else if (this.nextState) {
            return this.eventType + "->goto('" + this.nextState + "')"
        }
        else {
            throw new Error("The _Trigger is in an undefined state");
        }
    }

    constructor(
        previousTrigger: TriggerBuilder<TStates, TContext, TEvent, any>|undefined,
        parent:StateBuilder<TStates, TContext>,
        eventType:SchemaTypes,
        filter?:(e:TEvent) => boolean,
        log?:(ctx:TContext, e:TEvent) => void
    )
    {
        this.previousTrigger = previousTrigger;
        this._parent = parent;

        this.eventType = eventType;
        this.filter = filter;
        this.log = log;
    }

    await<TAwaitResult extends SchemaType>(promise:(context:TContext, event:TEvent) => Promise<TAwaitResult>)
        : {
        onErrorRetry:(times?:number) => TriggerBuilder<TStates, TContext, TEvent, TAwaitResult>,
        onErrorFail:() => TriggerBuilder<TStates, TContext, TEvent, TAwaitResult>,
        onErrorIgnore:() => TriggerBuilder<TStates, TContext, TEvent, TAwaitResult>
    }
    {
        this.awaitPromise = promise;

        const trigger = new TriggerBuilder<TStates, TContext, TEvent, TAwaitResult>(
            this,
            this._parent,
            this.eventType,
            this.filter);
        this._parent.triggers.push(trigger);

        const self = this;
        return {
            onErrorIgnore: () => {
                self.onErrorIgnoreFlag = true;
                return trigger;
            },
            onErrorRetry: times => {
                self.onErrorRetryFlag = true;
                self.onErrorRetryCount = times;
                return trigger;
            },
            onErrorFail: () => {
                return trigger;
            }
        };
    }

    send<TMessage extends SchemaType>(messageFactory:(context:TContext, event:TEvent, result:TResult) => Promise<TMessage>)
        : TriggerBuilder<TStates, TContext, TEvent, TMessage>
    {
        this.sendMessageFactory = messageFactory;

        const trigger = new TriggerBuilder<TStates, TContext, TEvent, TMessage>(
            this,
            this._parent,
            this.eventType,
            this.filter,
            this.log);
        this._parent.triggers.push(trigger);

        return trigger;
    }

    sendResult() : TriggerBuilder<TStates, TContext, TEvent, TResult>
    {
        this.sendResultFlag = true;

        const trigger = new TriggerBuilder<TStates, TContext, TEvent, TResult>(
            this,
            this._parent,
            this.eventType,
            this.filter);
        this._parent.triggers.push(trigger);

        return trigger;
    }

    goto(nextState:TStates) : StateBuilder<TStates, TContext>
    {
        this.nextState = nextState;
        return this._parent;
    }

    stay() :  StateBuilder<TStates, TContext>
    {
        this.stayFlag = true;
        return this._parent;
    }

    pipeEventTo(nextState:TStates) : StateBuilder<TStates, TContext>
    {
        this.pipeEventFlag = true;
        this.nextState = nextState;
        return this._parent;
    }

    pipeResultTo(nextState:TStates) : StateBuilder<TStates, TContext>
    {
        this.pipeResultFlag = true;
        this.nextState = nextState;
        return this._parent;
    }

    close() : StateBuilder<TStates, TContext>
    {
        this.closeFlag = true;
        return this._parent;
    }
}