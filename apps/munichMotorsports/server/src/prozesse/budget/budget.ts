import {Dialog} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {RuntimeState} from "@abis/dialog/dist/runtime/runtimeState";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {CompanionAgentDialogContext} from "@abis/dialog/dist/companionAgentDialogContext";
import {NeueBuchung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neueBuchung_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {SideEffects} from "./sideEffects";

export class Budget extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, session:Session_1_0_0)
    {
        super(duplexChannel, session);
    }

    protected build() : RuntimeState<string>[]
    {
        const builder = new DialogBuilder<
            ""
            , CompanionAgentDialogContext>();

        // TODO: Validierung (gibt es überhaupt genügend Budget etc.)
        builder
            .when("")
                .on<NeueBuchung_1_0_0>(SchemaTypes.NeueBuchung_1_0_0)
                    .await(SideEffects.neueBuchung)
                    .onErrorFail()
                    .stay()

        return builder.build();
    }
}

export const Class = Budget;
