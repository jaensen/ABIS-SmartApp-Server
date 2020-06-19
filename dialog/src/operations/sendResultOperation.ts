import {Operation} from "./operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class SendResultOperation<TContext extends IDialogContext> extends Operation<TContext>
{
    async execute(context: TContext, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        await context.send(
            "SendResultOperation: " + result._$schemaId,
            result);
        return result;
    }
}