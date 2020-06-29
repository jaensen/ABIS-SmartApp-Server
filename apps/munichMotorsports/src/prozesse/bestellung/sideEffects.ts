import {DialogContext} from "@abis/dialog/dist/dialog";
import {Sponsor_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/sponsor/_generated/sponsor_1_0_0";
import {SpeiseBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/ressource/_generated/speiseBudget_1_0_0";
import {NeueBuchung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neueBuchung_1_0_0";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {BudgetReservierung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/budget/_generated/budgetReservierung_1_0_0";
import {Auftrag_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/auftrag/_generated/auftrag_1_0_0";
import {Verdingungsbogen_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/verdingungsbogen/_generated/verdingungsbogen_1_0_0";
import {Barkaufabrechnung_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/barkaufabrechnung/_generated/barkaufabrechnung_1_0_0";

export class SideEffects
{
    static async reserviereBudgetFürAuftrag(context: DialogContext, auftrag:Auftrag_1_0_0) : Promise<BudgetReservierung_1_0_0>
    {
        throw new Error("Not implemented!")
    }
    static async reserviereBudgetFürVerdingung(context: DialogContext, verdingungsbogen:Verdingungsbogen_1_0_0) : Promise<BudgetReservierung_1_0_0>
    {
        throw new Error("Not implemented!")
    }
    static async reserviereBudgetFürBarkauf(context: DialogContext, barkauf:Barkaufabrechnung_1_0_0) : Promise<BudgetReservierung_1_0_0>
    {
        throw new Error("Not implemented!")
    }
}