import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";
import {BudgetReservierung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/budget/_generated/budgetReservierung_1_0_0";
import {Auftrag_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/auftrag/_generated/auftrag_1_0_0";
import {Verdingungsbogen_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/verdingungsbogen/_generated/verdingungsbogen_1_0_0";
import {Barkaufabrechnung_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/barkaufabrechnung/_generated/barkaufabrechnung_1_0_0";

export class SideEffects
{
    static async reserviereBudgetFürAuftrag(context: AgentDialogContext, auftrag:Auftrag_1_0_0) : Promise<BudgetReservierung_1_0_0>
    {
        throw new Error("Not implemented!")
    }
    static async reserviereBudgetFürVerdingung(context: AgentDialogContext, verdingungsbogen:Verdingungsbogen_1_0_0) : Promise<BudgetReservierung_1_0_0>
    {
        throw new Error("Not implemented!")
    }
    static async reserviereBudgetFürBarkauf(context: AgentDialogContext, barkauf:Barkaufabrechnung_1_0_0) : Promise<BudgetReservierung_1_0_0>
    {
        throw new Error("Not implemented!")
    }
}
