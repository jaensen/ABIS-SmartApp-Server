import {Dialog} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {CompanionAgentDialogContext} from "@abis/dialog/dist/companionAgentDialogContext";
import {NeueBestellung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/bestellung/_generated/neueBestellung_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {AskFor_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/interactionPatterns/_generated/askFor_1_0_0";
import {WaehleBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/bestellung/_generated/waehleBudget_1_0_0";
import {ErfasseBestellpositionen_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/bestellung/_generated/erfasseBestellpositionen_1_0_0";
import {Barkaufabrechnung_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/barkaufabrechnung/_generated/barkaufabrechnung_1_0_0";
import {SideEffects} from "./sideEffects";
import {Auftrag_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/auftrag/_generated/auftrag_1_0_0";
import {Verdingungsbogen_1_0_0} from "@abis/types/dist/schemas/hochschuleMünchen/types/formulare/verdingungsbogen/_generated/verdingungsbogen_1_0_0";

export class Bestellung extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, session: Session_1_0_0)
    {
        super(duplexChannel, session);
    }

    protected build()
    {
        const builder = new DialogBuilder<
            ""
            | "wähle_budget"
            | "erfasse_positionen"
            | "erfasse_barkauf"
            | "erfasse_auftrag"
            | "erfasse_verdingungsbogen"
            , CompanionAgentDialogContext>();

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
                .askFor(SchemaTypes.ErfasseBestellpositionen_1_0_0)
                .goto("erfasse_positionen")

            .when("erfasse_positionen")

                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0,
                        f => f.positionen.reduce((p, c) => p + ((c.menge ?? 0) * (c.preisJeEinheit ?? 0)), 0) <= 100)
                    .askFor(SchemaTypes.Barkaufabrechnung_1_0_0)
                    .goto("erfasse_barkauf")

                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0,
                        f => f.positionen.reduce((p, c) => p + ((c.menge ?? 0) * (c.preisJeEinheit ?? 0)), 0) <= 100)
                    .askFor(SchemaTypes.Auftrag_1_0_0)
                    .goto("erfasse_auftrag")

                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0,
                        f => f.positionen.reduce((p, c) => p + ((c.menge ?? 0) * (c.preisJeEinheit ?? 0)), 0) <= 100)
                    .askFor(SchemaTypes.Verdingungsbogen_1_0_0)
                    .goto("erfasse_verdingungsbogen")

                .on<ErfasseBestellpositionen_1_0_0>(SchemaTypes.ErfasseBestellpositionen_1_0_0,
                        f => f.positionen.reduce((p, c) => p + ((c.menge ?? 0) * (c.preisJeEinheit ?? 0)), 0) <= 100)
                    .askFor(SchemaTypes.Verdingungsbogen_1_0_0)
                    .goto("erfasse_verdingungsbogen")

            .when("erfasse_barkauf")
                .on<Barkaufabrechnung_1_0_0>(SchemaTypes.Barkaufabrechnung_1_0_0)
                .await(SideEffects.reserviereBudgetFürBarkauf)
                .onErrorFail()
                .close()

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
