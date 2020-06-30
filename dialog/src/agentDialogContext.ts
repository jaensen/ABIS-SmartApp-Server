import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";

export class AgentDialogContext implements AgentDialogContext
{
    close(): Promise<void>
    {
        return Promise.resolve(undefined);
    }

    goto(state: string, seedEvent: SchemaType | undefined): Promise<void>
    {
        return Promise.resolve(undefined);
    }

    send(name: string, data: SchemaType): Promise<NewEntry_1_0_0>
    {
        throw new Error("Not implemented");
    }

    readonly jwt: string;
    readonly session: Session_1_0_0;
    readonly agentId:number;

    constructor(agentId:number, jwt:string, session:Session_1_0_0)
    {
        this.agentId = agentId;
        this.jwt = jwt;
        this.session = session;
    }
}