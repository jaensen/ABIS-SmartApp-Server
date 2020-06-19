import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";

export interface IDialogContext
{
    session:Session_1_0_0;

    close():Promise<void>;
    send(name: string, data: SchemaType): Promise<NewEntry_1_0_0>;
    goto(state:string, seedEvent?:SchemaType):Promise<void>
}