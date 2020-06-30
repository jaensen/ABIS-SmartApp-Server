import {Group_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/group_1_0_0";
import {Agent_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/agent_1_0_0";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";

export class SideEffects {

    /**
     *
     * @param context
     * @param name
     */
    public static async createGroup(context: AgentDialogContext, name: string) : Promise<Group_1_0_0>
    {

        throw new Error("Not implemented");
    }

    public static async createGroupCompanion(context: AgentDialogContext, groupId: number, implementation:string) : Promise<Agent_1_0_0>
    {
        throw new Error("Not implemented");
    }

    public static async createEntryCompanion(context: AgentDialogContext, entryId: number, implementation:string) : Promise<Agent_1_0_0>
    {
        throw new Error("Not implemented");
    }

    public static postEntry(context: AgentDialogContext, entry: SchemaType, groupId: number) : Promise<NewEntry_1_0_0>
    {
        throw new Error("Not implemented");
    }
}