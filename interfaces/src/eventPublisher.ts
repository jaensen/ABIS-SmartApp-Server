import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";

export interface IEventPublisher
{
    publish(event: SchemaType, stop?:boolean):Promise<void>
}