import {Dialog, DialogContext} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {RuntimeState} from "@abis/dialog/dist/runtime/runtimeState";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {SpeiseBudget_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/ressource/_generated/speiseBudget_1_0_0";
import {SideEffects as RessourceSideEffects} from "./sideEffects";

export class Ressource extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, jwt: string)
    {
        super(duplexChannel, jwt);
    }

    protected build() : RuntimeState<string, DialogContext & {ressourceGroupId:number}>[]
    {
        const builder = new DialogBuilder<
            ""
            , DialogContext & {ressourceGroupId:number}>();

        builder
            .when("")
            // TODO: Validierung (gibt es überhaupt genügend Budget etc.)
                .on<SpeiseBudget_1_0_0>(SchemaTypes.SpeiseBudget_1_0_0)
                    .await(RessourceSideEffects.speiseBudget)
                    .onErrorFail()
                    .stay()

        return builder.build();
    }
}

export const Class = Ressource;