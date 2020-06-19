import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Operation} from "./operation";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class SendMessageOperation<TContext extends IDialogContext> extends Operation<TContext>
{
    readonly sendMessageFactory: (context: TContext, event: SchemaType, result: SchemaType) => Promise<SchemaType>;

    constructor(sendMessageFactory: (context: TContext, event: SchemaType, result: SchemaType) => Promise<SchemaType>)
    {
        super();
        this.sendMessageFactory = sendMessageFactory;
    }

    async execute(context: TContext, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        const message = await this.sendMessageFactory(context, event, result);
        await context.send(
            "SendMessageOperation: " + message._$schemaId,
            message
        );
        return message;
    }
}