import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Operation} from "./operation";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class SendMessageOperation extends Operation
{
    readonly sendMessageFactory: (context: any, event: SchemaType, result: SchemaType) => Promise<SchemaType>;

    constructor(sendMessageFactory: (context: any, event: SchemaType, result: SchemaType) => Promise<SchemaType>)
    {
        super();
        this.sendMessageFactory = sendMessageFactory;
    }

    async execute(context: any, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        const message = await this.sendMessageFactory(context, event, result);
        await context.send(
            "SendMessageOperation: " + message._$schemaId,
            message
        );
        return message;
    }
}