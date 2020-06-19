import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export abstract class Operation<TContext extends IDialogContext>
{
    abstract async execute(context: TContext, event: SchemaType, result: SchemaType): Promise<SchemaType>
}