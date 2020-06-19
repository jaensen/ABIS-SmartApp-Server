import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Operation} from "./operation";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class AwaitOperation<TStates extends string, TContext extends IDialogContext> extends Operation<TContext>
{
    readonly awaitPromise: (context: TContext, event: SchemaType) => Promise<SchemaType>;

    constructor(awaitPromise: (context: TContext, event: SchemaType) => Promise<SchemaType>)
    {
        super();
        this.awaitPromise = awaitPromise;
    }

    async execute(context: TContext, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        const awaitResult = await this.awaitPromise(context, event);
        return awaitResult;
    }
}