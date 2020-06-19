import {RuntimeAgent} from "./runtimeAgent";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {EventBroker} from "@abis/events/dist/eventBroker";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {NewMembership_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newMembership_1_0_0";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {Log} from "@abis/log/dist/log";
import {CloseChannel_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/closeChannel_1_0_0";
import {GroupClosed_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/groupClosed_1_0_0";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";

export abstract class DialogAgent extends RuntimeAgent
{
    private readonly _dialogEvents: EventBroker = new EventBroker();
    private readonly _duplexChannels: { [inChannelId: number]: IDuplexChannel } = {};

    protected abstract get dialogImplementation() : string;

    protected async onEvent(event: SchemaType): Promise<void>
    {
        switch (event._$schemaId)
        {
            case SchemaTypes.NewMembership_1_0_0: return await this._onNewMembership(<NewMembership_1_0_0>event);
            case SchemaTypes.NewEntry_1_0_0: return await this._onNewEntry(<NewEntry_1_0_0>event);
            case SchemaTypes.CloseChannel_1_0_0: return await this._onCloseChannel(<CloseChannel_1_0_0>event);
            case SchemaTypes.GroupClosed_1_0_0: return await this._onGroupClosed(<GroupClosed_1_0_0>event);
            default:
                Log.unhandled("DialogAgent:" + this.session.owner, "Received unhandled event.", event);
                break;
        }
    }

    private async _onNewEntry(event:NewEntry_1_0_0)
    {
        await this._dialogEvents.publishDirect(event.groupId, event);
    }

    private async _onCloseChannel(event:CloseChannel_1_0_0)
    {
        Log.log("DialogAgent:" + this.session.owner, "Received a CloseChannel event:", event);
        await this.data.close.channel(this.session.jwt, event.channelId);
    }

    private async _onGroupClosed(event:GroupClosed_1_0_0)
    {
        const duplexChannel = this._duplexChannels[event.groupId];
        if (!duplexChannel) {
            return;
        }
        await duplexChannel.close();
    }

    private async _onNewMembership(event:NewMembership_1_0_0)
    {
        Log.log("DialogAgent:" + this.session.owner, "Received NewMembership:", event);

        const group = await this.data.findGroup.byId(this.session.jwt, event.groupId);
        if (!group)
            throw new Error("Group " + event.groupId + " either doesn't exist or agent:" + this.session.owner + " has no access to it.");

        // Create a reverse channel
        const outChannel = await this.data.create.channel(
            this.session.jwt,
            this.session.owner + " -> " + event.creatorId,
            event.creatorId,
            group.volatile);

        const inEvents = this._dialogEvents.subscribe(event.groupId)
        const self = this;
        const duplexChannel = <IDuplexChannel>{
            inChannelId: event.groupId,
            ownAgentId: this.session.owner,
            partnerAgentId: event.creatorId,
            outChannelId: outChannel.id,
            inChannelEvents: inEvents,
            async send(name:string, data:SchemaType): Promise<NewEntry_1_0_0>
            {
                return await outChannel.addEntry(self.session.jwt, name, data);
            },
            async close()
            {
                // Send a CloseChannel_1_0_0 message to my agent
                await self.eventPublisher.publish(<CloseChannel_1_0_0> {
                    _$schemaId: SchemaTypes.CloseChannel_1_0_0,
                    $jwt: self.session.jwt,
                    channelId: outChannel.id
                });
                inEvents.stop();
            }
        };

        const impl = await import(self.dialogImplementation);
        const dialog = new impl.Class(duplexChannel, self.session.jwt);
        dialog.run();

        this._duplexChannels[event.groupId] = duplexChannel;
    }
}