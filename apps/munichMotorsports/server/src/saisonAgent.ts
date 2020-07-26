import {DialogAgent} from "@abis/agents/dist/dialogAgent";

export class SaisonAgent extends DialogAgent
{
    protected get dialogImplementation(): string
    {
        return "../../../apps/abis/dist/dialogs/authenticationDialog";
    }
}
export const Class = SaisonAgent;