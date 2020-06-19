import {Agent_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/agent_1_0_0";
import {Group_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/group_1_0_0";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";

export interface IFindAgent
{
    byJwt(jwt:string) : Promise<Agent_1_0_0|undefined>;
}

export interface IFindGroup
{
    byId(jwt:string, groupId:number) : Promise<undefined|Group_1_0_0 & {
        addEntry?: (jwt:string, name:string, data:SchemaType) => Promise<NewEntry_1_0_0>
    }>;
}

export interface IClose
{
    channel(jwt:string, channelId:number) : Promise<void>;
}

export interface ICreate
{
    channel(jwt:string, name:string, toAgentId:number, volatile?:boolean) : Promise<Group_1_0_0 & {
        addEntry: (jwt:string, name:string, data:SchemaType) => Promise<NewEntry_1_0_0>
    }>;
}

export interface IAgentData
{
    readonly findGroup: IFindGroup;
    readonly findAgent: IFindAgent;
    readonly close: IClose;
    readonly create: ICreate;
}