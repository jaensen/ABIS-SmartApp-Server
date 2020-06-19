import {DialogAgent} from "@abis/agents/dist/dialogAgent";

export class AuthenticationAgent extends DialogAgent
{
    protected get dialogImplementation(): string
    {
        return "";
    }
}
export const Class = AuthenticationAgent;