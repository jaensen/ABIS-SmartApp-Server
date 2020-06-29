import {DialogAgent} from "@abis/agents/dist/dialogAgent";

export class ProjektAgent extends DialogAgent
{
    protected get dialogImplementation(): string
    {
        return "../../../apps/abis/dist/dialogs/authenticationDialog";
    }
}
export const Class = ProjektAgent;