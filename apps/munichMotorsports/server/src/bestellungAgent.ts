import {DialogAgent} from "@abis/agents/dist/dialogAgent";

export class BestellungAgent extends DialogAgent
{
    protected get dialogImplementation(): string
    {
        return "../../../apps/abis/dist/dialogs/authenticationDialog";
    }
}
export const Class = BestellungAgent;