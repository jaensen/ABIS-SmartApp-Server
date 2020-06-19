import {Operation} from "./operation";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

export class PipeEventOperation<TStates extends string, TContext extends IDialogContext> extends Operation<TContext>
{
    readonly nextState: TStates;

    constructor(nextState: TStates)
    {
        super();
        this.nextState = nextState;
    }

    async execute(context: TContext, event: SchemaType, result: SchemaType): Promise<SchemaType>
    {
        await context.goto(this.nextState, event);
        return <Void_1_0_0>{
            _$schemaId: SchemaTypes.Void_1_0_0
        };
    }
}