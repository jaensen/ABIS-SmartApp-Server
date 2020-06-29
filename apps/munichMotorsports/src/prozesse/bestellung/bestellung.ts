import {Dialog, DialogContext} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {RuntimeState} from "@abis/dialog/dist/runtime/runtimeState";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {NeueBestellung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/bestellung/_generated/neueBestellung_1_0_0";
import {AskFor_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/interactionPatterns/_generated/askFor_1_0_0";
import {WaehleBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/bestellung/_generated/waehleBudget_1_0_0";
import {ErfasseBestellpositionen_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/bestellung/_generated/erfasseBestellpositionen_1_0_0";
import {Auftrag_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/auftrag/_generated/auftrag_1_0_0";
import {Verdingungsbogen_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/verdingungsbogen/_generated/verdingungsbogen_1_0_0";
import {SideEffects} from "./sideEffects";

export class Bestellung extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, jwt: string)
    {
        super(duplexChannel, jwt);
    }

    protected build() : RuntimeState<string, DialogContext & {budgetGroupId:number}>[]
    {
        const builder = new DialogBuilder<
            ""
            | "wähle_budget"
            | "erfasse_positionen"
            | "erfasse_auftrag"
            | "erfasse_verdingungsbogen"
            , DialogContext & {budgetGroupId:number}>();

        // TODO: Validierung (gibt es überhaupt genügend Budget etc.)
        builder
            .when("")
                .on<NeueBestellung_1_0_0>(SchemaTypes.NeueBestellung_1_0_0)
                .send(async (context) =>
                {
                    return <AskFor_1_0_0> {
                        _$schemaId: SchemaTypes.AskFor_1_0_0,
                        next: SchemaTypes.WaehleBudget_1_0_0
                    }
                })
                .goto("wähle_budget")

            .when("wähle_budget")
                .on<WaehleBudget_1_0_0>(SchemaTypes.WaehleBudget_1_0_0)
                .send(async (c) => {
                    return <AskFor_1_0_0>{
                        _$schemaId: SchemaTypes.AskFor_1_0_0,
                        next: SchemaTypes.ErfasseBestellpositionen_1_0_0
                    }
                })
                .goto("erfasse_positionen")

            .when("erfasse_positionen")
                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0, f => f.positionen.reduce((p, c) => p + (c.menge * c.preisJeEinheit), 0) <= 100)
                .send(async (c) => {
                    return <AskFor_1_0_0>{
                        _$schemaId: SchemaTypes.AskFor_1_0_0,
                        next: SchemaTypes.Barkaufabrechnung_1_0_0
                    }
                })
                .stay()

                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0, f => f.positionen.reduce((p, c) => p + (c.menge * c.preisJeEinheit), 0) <= 1000)
                    .send(async (c) => {
                        return <AskFor_1_0_0>{
                            _$schemaId: SchemaTypes.AskFor_1_0_0,
                            next: SchemaTypes.Auftrag_1_0_0
                        }
                    })
                    .goto("erfasse_auftrag")

                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0, f => f.positionen.reduce((p, c) => p + (c.menge * c.preisJeEinheit), 0) <= 10000)
                    .send(async (c) => {
                        return <AskFor_1_0_0>{
                            _$schemaId: SchemaTypes.AskFor_1_0_0,
                            next: SchemaTypes.Verdingungsbogen_1_0_0
                        }
                    })
                    .goto("erfasse_verdingungsbogen")

                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0, f => f.positionen.reduce((p, c) => p + (c.menge * c.preisJeEinheit), 0) > 10000)
                    .send(async (c) => {
                        return <AskFor_1_0_0>{
                            _$schemaId: SchemaTypes.AskFor_1_0_0,
                            next: SchemaTypes.Verdingungsbogen_1_0_0
                        }
                    })
                    .goto("erfasse_verdingungsbogen")

            .when("erfasse_auftrag")
                .on<Auftrag_1_0_0>(SchemaTypes.Auftrag_1_0_0)
                .await(SideEffects.reserviereBudgetFürAuftrag)
                    .onErrorFail()
                .close()

            .when("erfasse_verdingungsbogen")
                .on<Verdingungsbogen_1_0_0>(SchemaTypes.Verdingungsbogen_1_0_0)
                .await(SideEffects.reserviereBudgetFürVerdingung)
                    .onErrorFail()
                .close()

        // TODO: Weiter mit "erfasse_auftrag"

        return builder.build();
    }
}

export const Class = Bestellung;