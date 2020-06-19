import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {DialogBuilder} from "./dialogBuilder";
import {TriggerBuilder} from "./triggerBuilder";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class StateBuilder<
    TStates extends string,
    TContext extends IDialogContext
    >
{
    private readonly _parent:DialogBuilder<TStates, TContext>;

    readonly name:TStates;

    readonly triggers:TriggerBuilder<TStates, TContext, any, any>[] = [];

    constructor(parent:DialogBuilder<TStates, TContext>, name:TStates)
    {
        this._parent = parent;

        this.name = name;
    }

    when(state:TStates) : StateBuilder<TStates, TContext>
    {
        return this._parent.when(state);
    }

    onEnter(log?:(ctx:TContext, e:Void_1_0_0) => void) : TriggerBuilder<TStates, TContext, Void_1_0_0, Void_1_0_0>
    {
        const trigger = new TriggerBuilder<TStates, TContext, Void_1_0_0, Void_1_0_0>(
            undefined,
            this,
            SchemaTypes.Void_1_0_0,
            undefined,
            log);
        this.triggers.push(trigger);

        return trigger;
    }

    on<TEvent extends SchemaType>(
        eventType:SchemaTypes,
        filter?:(e:TEvent) => boolean,
        log?:(ctx:TContext, e:TEvent) => void
    )
        : TriggerBuilder<TStates, TContext, TEvent, Void_1_0_0>
    {
        const trigger = new TriggerBuilder<TStates, TContext, TEvent, Void_1_0_0>(
            undefined,
            this,
            eventType,
            filter,
            log);
        this.triggers.push(trigger);

        return trigger;
    }
}