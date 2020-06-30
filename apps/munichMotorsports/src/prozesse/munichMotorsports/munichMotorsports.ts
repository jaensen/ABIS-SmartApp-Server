import {Dialog} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {RuntimeState} from "@abis/dialog/dist/runtime/runtimeState";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {NeueSaison_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/saison/_generated/neueSaison_1_0_0";
import {NeuerSponsor_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/sponsor/_generated/neuerSponsor_1_0_0";
import {NeueRessource_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/ressource/_generated/neueRessource_1_0_0";
import {NeuesProjekt_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/projekt/_generated/neuesProjekt_1_0_0";
import {NeuesBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neuesBudget_1_0_0";
import {SideEffects as MmsSideEffects} from "./sideEffects";
import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";

export class MunichMotorsports extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, session:Session_1_0_0)
    {
        super(duplexChannel, session);
    }

    protected build() : RuntimeState<string>[]
    {
        const builder = new DialogBuilder<
            ""
            , AgentDialogContext>();

        // TODO: Validierung (gibt es überhaupt genügend Budget etc.)
        builder
            .when("")
                .on<NeueSaison_1_0_0>(SchemaTypes.NeueSaison_1_0_0)
                    .await(MmsSideEffects.erstelleNeueSaison)
                        .onErrorRetry()
                    .stay()

                .on<NeuerSponsor_1_0_0>(SchemaTypes.NeuerSponsor_1_0_0)
                    .await(MmsSideEffects.erstelleNeuenSponsor)
                        .onErrorRetry()
                    .stay()

                .on<NeueRessource_1_0_0>(SchemaTypes.NeueRessource_1_0_0)
                    .await(MmsSideEffects.erstelleNeueRessource)
                        .onErrorRetry()
                    .stay()

                .on<NeuesProjekt_1_0_0>(SchemaTypes.NeuesProjekt_1_0_0)
                    .await(MmsSideEffects.erstelleNeuesProjekt)
                        .onErrorRetry()
                    .stay()

                .on<NeuesBudget_1_0_0>(SchemaTypes.NeuesBudget_1_0_0)
                    .await(MmsSideEffects.erstelleNeuesBudget)
                        .onErrorRetry()
                    .stay()

        return builder.build();
    }
}

export const Class = MunichMotorsports;