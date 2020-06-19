import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";

export interface IEventRouter
{
    getRecipients(event: SchemaType, stop: boolean): Promise<number[]>;
}