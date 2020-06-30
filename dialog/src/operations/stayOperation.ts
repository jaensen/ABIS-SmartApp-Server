import {Operation} from "./operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class StayOperation<TStates extends string> extends Operation
{
    constructor()
    {
        super();
    }

    async execute(context: any, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        return result;
    }
}