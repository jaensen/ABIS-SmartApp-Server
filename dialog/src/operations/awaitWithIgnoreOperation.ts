import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Operation} from "./operation";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class AwaitWithIgnoreOperation<TStates extends string> extends Operation
{
    readonly awaitPromise: (context: any, event: SchemaType, result: SchemaType) => Promise<SchemaType>;

    constructor(awaitPromise: (context: any, event: SchemaType, result: SchemaType) => Promise<SchemaType>)
    {
        super();
        this.awaitPromise = awaitPromise;
    }

    async execute(context: any, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        try
        {
            return await this.awaitPromise(context, event, result);
        }
        catch (e)
        {
            // TODO: Log warning
            return <Void_1_0_0>{
                _$schemaId: SchemaTypes.Void_1_0_0
            };
        }
    }
}