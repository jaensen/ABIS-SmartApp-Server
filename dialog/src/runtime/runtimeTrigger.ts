import {TriggerBuilder} from "../triggerBuilder";
import {Operation} from "../operations/operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class RuntimeTrigger<TStates extends string, TContext extends IDialogContext>
{
    readonly root: TriggerBuilder<TStates, TContext, any, any>;
    readonly chain: TriggerBuilder<TStates, TContext, any, any>[];
    readonly ops: Operation<TContext>[];

    constructor(root: TriggerBuilder<TStates, TContext, any, any>,
                chain: TriggerBuilder<TStates, TContext, any, any>[],
                ops: Operation<TContext>[])
    {
        this.root = root;
        this.chain = chain;
        this.ops = ops;
    }

    canHandle(event:SchemaType): boolean
    {
        const filter = this.root.filter ?? (e => true);
        return this.root.eventType == event._$schemaId && filter(event);
    }

    async execute(context:TContext, event:SchemaType) : Promise<void>
    {
        let result:SchemaType = <Void_1_0_0>{ _$schemaId: SchemaTypes.Void_1_0_0 };

        for (let op of this.ops)
        {
            result = await op.execute(context, event, result);
        }
    }
}