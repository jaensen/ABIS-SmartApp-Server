import {RuntimeState} from "./runtimeState";
import {RuntimeTrigger} from "./runtimeTrigger";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Log} from "@abis/log/dist/log";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class RuntimeDialog<TStates extends string>
{
    context:any;
    states:RuntimeState<TStates>[];
    currentState?:RuntimeState<TStates>

    constructor(build: RuntimeState<TStates>[], context: any)
    {
        this.states = build;
        this.context = context;

        const initialState = this.states.find(o => o.name == "");
        if (!initialState)
        {
            throw new Error("There must be an initial/empty state (name: '').");
        }
    }

    async setState(context:any, nextStateName:string)
    {
        const nextState = this.states.find(o => o.name == nextStateName);
        if (!nextState)
        {
            throw new Error("Couldn't find state '" + nextStateName + "'");
        }

        this.currentState = nextState;
        Log.log("_Runtime", "Set state '" + this.currentState.name + "'");

        let defaultTrigger: RuntimeTrigger<any> | undefined;

        const defaultTriggers = nextState.triggers.filter(o => o.root.eventType == SchemaTypes.Void_1_0_0);
        if (defaultTriggers.length > 1)
        {
            throw new Error("Found more than one default trigger in state '" + nextStateName + "': ");
        }
        if (defaultTriggers.length == 1)
        {
            defaultTrigger = defaultTriggers[0];
        }
        if (defaultTrigger)
        {
            await defaultTrigger.execute(context, <Void_1_0_0>{_$schemaId: SchemaTypes.Void_1_0_0});
        }
    }

    async execute(event:SchemaType)
    {
        Log.log("_Runtime", "Execute in state '" + this.currentState?.name + "'. Event: ", event);

        const foundTriggers = this.currentState?.triggers.filter(o => o.canHandle(event)) ?? [];
        if (foundTriggers.length > 1)
        {
            throw new Error("Found more than one trigger for event in state '" + this.currentState?.name + "': ");
        }
        if (foundTriggers.length == 0)
        {
            throw new Error("Found no trigger for event '" + event._$schemaId + "' in state '" + this.currentState?.name + "': ");
        }

        const foundTrigger = foundTriggers[0];
        await foundTrigger.execute(this.context, event);
    }
}