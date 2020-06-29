import {DialogContext} from "@abis/dialog/dist/dialog";
import {Group_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/group_1_0_0";
import {Agent_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/agent_1_0_0";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";

export class SideEffects {

    /**
     *
     * @param context
     * @param name
     */
    public static async createGroup(context: DialogContext, name: string) : Promise<Group_1_0_0>
    {

        throw new Error("Not implemented");
    }

    public static async createGroupCompanion(context: DialogContext, groupId: number, implementation:string) : Promise<Agent_1_0_0>
    {
        throw new Error("Not implemented");
    }

    public static async createEntryCompanion(context: DialogContext, entryId: number, implementation:string) : Promise<Agent_1_0_0>
    {
        throw new Error("Not implemented");
    }

    public static postEntry(context: DialogContext, entry: SchemaType, groupId: number) : Promise<NewEntry_1_0_0>
    {
        throw new Error("Not implemented");
    }
}