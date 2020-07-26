/**
 * This kind of agent is primarily controlled by the client.
 * It executes all commands that the client sends to it and further handles notifications etc. for a profile.
 * This includes e.g.: creating channels, creating entries, closing channels ..
 */
import {RuntimeAgent} from "@abis/agents/dist/runtimeAgent";
import {Emitter} from "@abis/events/dist/emitter";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {IAgentData} from "@abis/interfaces/dist/agentData";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {CreateChannel_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/createChannel_1_0_0";
import {Log} from "@abis/log/dist/log";
import {CreateEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/createEntry_1_0_0";
import {CloseChannel_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/closeChannel_1_0_0";

export class ProfileAgent extends RuntimeAgent
{
    constructor(id:number, eventSource:Emitter<SchemaType>, eventPublisher:IEventPublisher, agentData: IAgentData)
    {
        super(id, eventSource, eventPublisher, agentData);
    }

    async onEvent(event: SchemaType): Promise<void>
    {
        if (event._$schemaId == SchemaTypes.CreateChannel_1_0_0)
        {
            Log.log("ProfileAgent:" + this.session.owner, "Received a CreateChannel event:", event);

            const createChannel = <CreateChannel_1_0_0>event;
            await this.data.create.channel(
                this.session.jwt,
                createChannel.name,
                createChannel.toAgentId,
                createChannel.volatile);
        }
        else if (event._$schemaId == SchemaTypes.CreateEntry_1_0_0)
        {
            Log.log("ProfileAgent:" + this.session.owner, "Received a CreateEntry event:", event);

            const createEntry = <CreateEntry_1_0_0>event;
            const group = await this.data.findGroup.byId(createEntry.$jwt, createEntry.inGroupId);
            if (!group) {
                throw new Error("ProfileAgent:" + this.session.owner + " cannot create an entry in group " + createEntry.inGroupId + " because the group either doesn't exist or the agent has no access to it.")
            }
            if (!group.addEntry) {
                throw new Error("ProfileAgent:" + this.session.owner + " cannot add entries to group " + createEntry.inGroupId + ".")
            }

            const entry = await group.addEntry(createEntry.$jwt, createEntry.name, <SchemaType>createEntry.data);
            Log.log("ProfileAgent:" + this.session.owner, "Created new entry", entry);
        }
        else if (event._$schemaId == SchemaTypes.CloseChannel_1_0_0)
        {
            Log.log("ProfileAgent:" + this.session.owner, "Received a CloseChannel event:", event);

            const closeChannel = <CloseChannel_1_0_0>event;
            await this.data.close.channel(this.session.jwt, closeChannel.channelId);
        }
        else
        {
            Log.unhandled("ProfileAgent:" + this.session.owner, "Received an unhandled SystemEvent.", event);
        }
    }
}

export const Class = ProfileAgent;
