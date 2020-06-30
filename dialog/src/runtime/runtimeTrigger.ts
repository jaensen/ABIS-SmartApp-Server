import {TriggerBuilder} from "../triggerBuilder";
import {Operation} from "../operations/operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class RuntimeTrigger<TStates extends string>
{
    readonly root: TriggerBuilder<TStates, any, any, any>;
    readonly chain: TriggerBuilder<TStates, any, any, any>[];
    readonly ops: Operation[];

    constructor(root: TriggerBuilder<TStates, any, any, any>,
                chain: TriggerBuilder<TStates, any, any, any>[],
                ops: Operation[])
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

    async execute(context:any, event:SchemaType) : Promise<void>
    {
        let result:SchemaType = <Void_1_0_0>{ _$schemaId: SchemaTypes.Void_1_0_0 };

        for (let op of this.ops)
        {
            result = await op.execute(context, event, result);
        }
    }
}