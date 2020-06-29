import {DialogContext} from "@abis/dialog/dist/dialog";
import {Sponsor_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/sponsor/_generated/sponsor_1_0_0";
import {SpeiseBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/ressource/_generated/speiseBudget_1_0_0";
import {NeueBuchung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neueBuchung_1_0_0";

export class SideEffects
{
    static async neueBuchung(context: DialogContext, neueBuchung:NeueBuchung_1_0_0) : Promise<Buchung_1_0_0>
    {
    }
}