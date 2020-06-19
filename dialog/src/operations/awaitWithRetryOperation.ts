import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Operation} from "./operation";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {Retry_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/interactionPatterns/_generated/retry_1_0_0";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class AwaitWithRetryOperation<TContext extends IDialogContext> extends Operation<TContext>
{
    readonly awaitPromise: (context: TContext, event: SchemaType) => Promise<SchemaType>;

    constructor(awaitPromise: (context: TContext, event: SchemaType) => Promise<SchemaType>, tries:number = 3)
    {
        super();
        this.awaitPromise = awaitPromise;
    }

    async execute(context: TContext, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        try
        {
            return await this.awaitPromise(context, event);
        }
        catch (e)
        {
            // TODO: Log warning
            const retry = <Retry_1_0_0>{
                _$schemaId: SchemaTypes.Retry_1_0_0,
                faultyEntry: event,
                reason: e
            };
            await context.send(
                "Retry",
                retry
            );
            return retry;
        }
    }
}