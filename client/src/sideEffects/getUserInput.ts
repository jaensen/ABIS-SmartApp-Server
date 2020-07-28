import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {UiDialogContext} from "../dialogs/UiDialogContext";

/**
 * Should query the requested data from the user via a UI-dialog or similar.
 * @param outType The expected SchemaType
 */
export function getUserInput<TContext extends UiDialogContext, TOut extends SchemaType>(outType:SchemaTypes)
    : ((context:TContext, event:SchemaType) => Promise<SchemaType>)
{
        return async (context:TContext, event:SchemaType) =>
        {
            const object = await context.uiService.getUserInput(outType);
            return <SchemaType>{
                ...object,
                _$schemaId: outType
            };
        };
}
