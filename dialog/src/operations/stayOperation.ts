import {Operation} from "./operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class StayOperation<TStates extends string, TContext extends IDialogContext> extends Operation<TContext>
{
    constructor()
    {
        super();
    }

    async execute(context: TContext, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        return result;
    }
}