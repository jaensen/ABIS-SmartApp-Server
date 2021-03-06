import {Operation} from "./operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class CloseOperation extends Operation
{
    async execute(context: any, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        await context.close();
        return <Void_1_0_0>{
            _$schemaId: SchemaTypes.Void_1_0_0
        };
    }
}