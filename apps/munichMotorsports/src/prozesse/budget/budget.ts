import {Dialog, DialogContext} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {RuntimeState} from "@abis/dialog/dist/runtime/runtimeState";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {NeueBuchung_1_0_0} from "@abis/types/dist/schemas/munichMotorsports/types/prozesse/budget/_generated/neueBuchung_1_0_0";
import {SideEffects} from "../sideEffects";
import {SideEffects as BudgetSideEffects} from "./sideEffects";

export class Budget extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, jwt: string)
    {
        super(duplexChannel, jwt);
    }

    protected build() : RuntimeState<string, DialogContext & {budgetGroupId:number}>[]
    {
        const builder = new DialogBuilder<
            ""
            , DialogContext & {budgetGroupId:number}>();

        // TODO: Validierung (gibt es überhaupt genügend Budget etc.)
        builder
            .when("")
                .on<NeueBuchung_1_0_0>(SchemaTypes.NeueBuchung_1_0_0)
                    .await(BudgetSideEffects.neueBuchung)
                    .onErrorFail()
                    .stay()

        return builder.build();
    }
}

export const Class = Budget;