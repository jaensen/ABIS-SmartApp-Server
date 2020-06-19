import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {IEventPublisher} from "./eventPublisher";
import {IAgentData} from "./agentData";

export interface IRuntimeAgent
{
    session:Session_1_0_0;
    events:AsyncIterable<SchemaType>;
    eventPublisher:IEventPublisher;
    data:IAgentData;

    run():Promise<void>;
    stop():Promise<void>;
}