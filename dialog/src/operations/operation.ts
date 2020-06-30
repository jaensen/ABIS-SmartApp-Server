import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export abstract class Operation
{
    abstract async execute(context: any, event: SchemaType, result: SchemaType): Promise<SchemaType>
}