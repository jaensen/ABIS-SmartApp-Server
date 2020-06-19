import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";

export interface IDuplexChannel {
    ownAgentId:number
    inChannelId:number
    inChannelEvents:AsyncIterable<SchemaType>
    outChannelId:number
    partnerAgentId:number

    send(name:string, data:SchemaType): Promise<NewEntry_1_0_0>;
    close(): Promise<void>;
}