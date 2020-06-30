import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Operation} from "./operation";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class AwaitOperation<TStates extends string> extends Operation
{
    readonly awaitPromise: (context: any, event: SchemaType, result: SchemaType) => Promise<SchemaType>;

    constructor(awaitPromise: (context: any, event: SchemaType, result: SchemaType) => Promise<SchemaType>)
    {
        super();
        this.awaitPromise = awaitPromise;
    }

    async execute(context: any, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        const awaitResult = await this.awaitPromise(context, event, result);
        return awaitResult;
    }
}