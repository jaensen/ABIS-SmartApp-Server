import {Operation} from "./operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class SendResultOperation extends Operation
{
    async execute(context: any, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        await context.send(
            "SendResultOperation: " + result._$schemaId,
            result);
        return result;
    }
}