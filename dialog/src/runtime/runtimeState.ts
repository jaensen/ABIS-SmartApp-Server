import {RuntimeTrigger} from "./runtimeTrigger";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class RuntimeState<TStates extends string>
{
    readonly name:string
    readonly triggers:RuntimeTrigger<TStates>[];

    constructor(name:string, triggers:RuntimeTrigger<TStates>[])
    {
        this.name = name;
        this.triggers = triggers;
    }
}