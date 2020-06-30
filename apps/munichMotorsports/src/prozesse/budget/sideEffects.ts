import {NeueBuchung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neueBuchung_1_0_0";
import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";
import {Buchung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/budget/_generated/buchung_1_0_0";

export class SideEffects
{
    static async neueBuchung(context: AgentDialogContext, neueBuchung:NeueBuchung_1_0_0) : Promise<Buchung_1_0_0>
    {
        throw new Error("Not implemented")
    }
}