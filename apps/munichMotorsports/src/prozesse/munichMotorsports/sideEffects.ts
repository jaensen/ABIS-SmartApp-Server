import {Sponsor_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/sponsor/_generated/sponsor_1_0_0";
import {SideEffects as BaseSideEffects} from "../sideEffects";
import {NeueSaison_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/saison/_generated/neueSaison_1_0_0";
import {Saison_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/saison/_generated/saison_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {NeuerSponsor_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/sponsor/_generated/neuerSponsor_1_0_0";
import {NeueRessource_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/ressource/_generated/neueRessource_1_0_0";
import {Ressource_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/ressource/_generated/ressource_1_0_0";
import {NeuesProjekt_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/projekt/_generated/neuesProjekt_1_0_0";
import {Projekt_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/projekt/_generated/projekt_1_0_0";
import {NeuesBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neuesBudget_1_0_0";
import {Budget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/_lib/budget/_generated/budget_1_0_0";
import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";

export class SideEffects {

    static async erstelleNeueSaison(context: AgentDialogContext, neueSaison:NeueSaison_1_0_0) : Promise<Saison_1_0_0>
    {
        if (!neueSaison.neueSaison?.name || neueSaison.neueSaison.name.trim() == "")
        {
            throw new Error("Die neue Saison muss einen eindeutigen Namen haben.");
        }

        const neueGruppe = await BaseSideEffects.createGroup(context, neueSaison.neueSaison.name);
        const companion = await BaseSideEffects.createGroupCompanion(context, neueGruppe.id, "@abis/apps_munichMotorsports/saisonAgent");
        const entry = await BaseSideEffects.postEntry(context, neueSaison, neueGruppe.id);

        return <Saison_1_0_0> {
            _$schemaId: SchemaTypes.Saison_1_0_0,
            id: neueGruppe.id,
            name: neueSaison.neueSaison.name,
            beginn: neueSaison.neueSaison.beginn,
            ende: neueSaison.neueSaison.ende
        };
    }

    static async erstelleNeuenSponsor(context: AgentDialogContext, neuerSponsor:NeuerSponsor_1_0_0) : Promise<Sponsor_1_0_0>
    {
        if (!neuerSponsor.neuerSponsor?.name || neuerSponsor.neuerSponsor.name.trim() == "")
        {
            throw new Error("Der neue Sponsor muss einen eindeutigen Namen haben.");
        }

        const neueGruppe = await BaseSideEffects.createGroup(context, neuerSponsor.neuerSponsor.name);
        const companion = await BaseSideEffects.createGroupCompanion(context, neueGruppe.id, "@abis/apps_munichMotorsports/sponsorAgent");
        const entry = await BaseSideEffects.postEntry(context, neuerSponsor, neueGruppe.id);

        return <Sponsor_1_0_0> {
            _$schemaId: SchemaTypes.Sponsor_1_0_0,
            id: neueGruppe.id,
            name: neuerSponsor.neuerSponsor.name
        };
    }

    static async erstelleNeueRessource(context: AgentDialogContext, neueRessource:NeueRessource_1_0_0) : Promise<Ressource_1_0_0>
    {
        if (!neueRessource.neueRessource?.name || neueRessource.neueRessource.name.trim() == "")
        {
            throw new Error("Die neue Ressource muss einen eindeutigen Namen haben.");
        }
        if (!neueRessource.vonSponsor || !neueRessource.vonSponsor.name)
        {
            throw new Error("Es muss übergeben werden, von welchem Sponsor die Ressource bereitgestellt wird.");
        }

        const sponsor = await this._findeSponsor(context, neueRessource.vonSponsor.name);
        const neueGruppe = await BaseSideEffects.createGroup(context, neueRessource.neueRessource.name);
        const companion = await BaseSideEffects.createGroupCompanion(context, neueGruppe.id, "@abis/apps_munichMotorsports/ressourceAgent");
        const entry = await BaseSideEffects.postEntry(context, neueRessource, neueGruppe.id);

        return <Ressource_1_0_0> {
            _$schemaId: SchemaTypes.Ressource_1_0_0,
            id: neueGruppe.id,
            beschreibung: neueRessource.neueRessource.beschreibung,
            geldwert: neueRessource.neueRessource.geldwert,
            kategorie: neueRessource.neueRessource.kategorie,
            name: neueRessource.neueRessource.name
        };
    }


    static async erstelleNeuesProjekt(context: AgentDialogContext, neuesProjekt:NeuesProjekt_1_0_0) : Promise<Projekt_1_0_0>
    {
        if (!neuesProjekt.neuesProjekt?.name || neuesProjekt.neuesProjekt.name.trim() == "")
        {
            throw new Error("Das neue Projekt muss einen eindeutigen Namen haben.");
        }

        const neueGruppe = await BaseSideEffects.createGroup(context, neuesProjekt.neuesProjekt.name);
        const companion = await BaseSideEffects.createGroupCompanion(context, neueGruppe.id, "@abis/apps_munichMotorsports/projektAgent");
        const entry = await BaseSideEffects.postEntry(context, neuesProjekt, neueGruppe.id);

        return <Projekt_1_0_0>{
            _$schemaId: SchemaTypes.Projekt_1_0_0,
            id: neueGruppe.id,
            beginn: neuesProjekt.neuesProjekt.beginn,
            ende: neuesProjekt.neuesProjekt.ende,
            name: neuesProjekt.neuesProjekt.name
        }
    }


    static async erstelleNeuesBudget(context: AgentDialogContext, neuesBudget:NeuesBudget_1_0_0) : Promise<Budget_1_0_0>
    {
        if (!neuesBudget.neuesBudget?.name || neuesBudget.neuesBudget.name.trim() == "")
        {
            throw new Error("Das neue Projekt muss einen eindeutigen Namen haben.");
        }

        const neueGruppe = await BaseSideEffects.createGroup(context, neuesBudget.neuesBudget.name);
        const companion = await BaseSideEffects.createGroupCompanion(context, neueGruppe.id, "@abis/apps_munichMotorsports/budgetAgent");
        const entry = await BaseSideEffects.postEntry(context, neuesBudget, neueGruppe.id);

        return <Budget_1_0_0>{
            _$schemaId: SchemaTypes.Budget_1_0_0,
            id: neueGruppe.id,
            name: neuesBudget.neuesBudget.name
        };
    }

    /**
     * Sucht nach dem angegebenen Sponsor wobei das übergebene Objekt als Filter verwendet wird.
     * @param context
     * @param name Das Filterobjekt.
     */
    private static async _findeSponsor(context: AgentDialogContext, name: string) : Promise<Sponsor_1_0_0>
    {
        throw new Error("Not implemented");
    }
}