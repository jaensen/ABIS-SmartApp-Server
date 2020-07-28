import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";

export interface IUiService
{
    getUserInput<TOut extends SchemaType>(outType:SchemaTypes)
        : (event:SchemaType) => Promise<SchemaType>;
}

export class UiDialogContext extends AgentDialogContext
{
    readonly uiService:IUiService;

    constructor(agentId:number, jwt:string, session:Session_1_0_0, uiService:IUiService)
    {
        super(agentId, jwt, session);

        this.uiService = uiService;
    }
}
