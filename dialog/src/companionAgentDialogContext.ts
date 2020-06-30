import {AgentDialogContext} from "./agentDialogContext";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";

export enum CompanionType
{
    AgentCompanion = "AgentCompanion",
    GroupCompanion = "GroupCompanion"
}

export class CompanionAgentDialogContext extends AgentDialogContext
{
    readonly companionType:CompanionType;
    readonly baseObjectId:number;

    constructor(agentId:number, jwt:string, session:Session_1_0_0, companionType:CompanionType, baseObjectId:number)
    {
        super(agentId, jwt, session);

        this.companionType = companionType;
        this.baseObjectId = baseObjectId;
    }
}