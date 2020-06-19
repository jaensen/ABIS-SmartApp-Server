import {RuntimeTrigger} from "./runtimeTrigger";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class RuntimeState<TStates extends string, TContext extends IDialogContext>
{
    readonly name:string
    readonly triggers:RuntimeTrigger<TStates, TContext>[];

    constructor(name:string, triggers:RuntimeTrigger<TStates, TContext>[])
    {
        this.name = name;
        this.triggers = triggers;
    }
}