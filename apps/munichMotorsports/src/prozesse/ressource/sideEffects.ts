import {SpeiseBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/ressource/_generated/speiseBudget_1_0_0";
import {NeueBuchung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neueBuchung_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {SideEffects as BaseSideEffects} from "../sideEffects";
import {Ressource_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/ressource/_generated/ressource_1_0_0";
import {Budget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/budget/_generated/budget_1_0_0";
import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";

export class SideEffects
{
    static async ladeRessource(context: AgentDialogContext, ressourceId:number) : Promise<Ressource_1_0_0>
    {
        throw new Error("Not implemented");
    }
    static async ladeBudget(context: AgentDialogContext, budgetId:number) : Promise<Budget_1_0_0>
    {
        throw new Error("Not implemented");
    }

    static async speiseBudget(context: AgentDialogContext, speiseBudget:SpeiseBudget_1_0_0) : Promise<NeueBuchung_1_0_0>
    {
        if (!speiseBudget.quelle || !speiseBudget.quelle.id)
        {
            throw new Error("Es muss eine Quell-Ressourcen ID angegeben werden.");
        }
        if (!speiseBudget.ziel || !speiseBudget.ziel.id)
        {
            throw new Error("Es muss eine Ziel-Budget ID angegeben werden.");
        }

        const quellRessource = await this.ladeRessource(context, speiseBudget.quelle.id);
        const zielBudget = await  this.ladeBudget(context, speiseBudget.ziel.id);

        const neueBuchung = <NeueBuchung_1_0_0>{
            _$schemaId: SchemaTypes.NeueBuchung_1_0_0,
            quelle: {
                id: speiseBudget.quelle.id
            },
            ziel: {
                id: speiseBudget.ziel.id
            },
            kommentar: "",
            wert: speiseBudget.wert
        };

        const entry = await BaseSideEffects.postEntry(context, neueBuchung, speiseBudget.ziel.id);

        return neueBuchung;
    }
}