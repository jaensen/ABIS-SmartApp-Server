import {IEventRouter} from "@abis/interfaces/dist/eventRouter";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {CreateEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/createEntry_1_0_0";
import {NewSession_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newSession_1_0_0";
import {NewGroup_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newGroup_1_0_0";
import {NewMembership_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newMembership_1_0_0";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {GroupClosed_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/groupClosed_1_0_0";
import {Log} from "@abis/log/dist/log";
import {SessionRepo} from "@abis/data/dist/sessionRepo";
import {GroupRepo, GroupType} from "@abis/data/dist/groupRepo";

export class EventRouter implements IEventRouter
{
    private readonly _sessionRepo: SessionRepo;
    private readonly _groupRepo: GroupRepo;

    constructor(sessionRepo: SessionRepo, groupRepo: GroupRepo)
    {
        this._groupRepo = groupRepo;
        this._sessionRepo = sessionRepo;
    }

    private async getPossibleRecipients(event: SchemaType, stop: boolean)
    {
        if (event._$schemaId == SchemaTypes.CreateChannel_1_0_0
            || event._$schemaId == SchemaTypes.CloseChannel_1_0_0)
        {
            // Send this to the agent that belongs to the session
            const session = await this._sessionRepo.findSessionByJwt((<any>event).$jwt);
            return session ? [session.owner] : [];
        }
        else if (event._$schemaId == SchemaTypes.CreateEntry_1_0_0)
        {
            // Send this to the agent that belongs to the session
            const createEntry = <CreateEntry_1_0_0>event;
            const session = await this._sessionRepo.findSessionByJwt(createEntry.$jwt);
            return session ? [session.owner] : [];
        }
        else if (event._$schemaId == SchemaTypes.NewSession_1_0_0)
        {
            const newSession = <NewSession_1_0_0>event;
            // Will be routed to the owner
            return [newSession.owner];
        }
        else if (event._$schemaId == SchemaTypes.NewGroup_1_0_0)
        {
            const newGroup = <NewGroup_1_0_0>event;
            // Will be routed to the owner
            return [newGroup.owner];
        }
        else if (event._$schemaId == SchemaTypes.NewMembership_1_0_0)
        {
            const newMembership = <NewMembership_1_0_0>event;
            const group = await this._groupRepo.findGroupById(newMembership.groupId);
            if (!group)
            {
                throw new Error("Cannot find a group with id " + newMembership.groupId)
            }
            if (group.type != GroupType.Channel)
            {
                throw new Error("The EventRouter can only handle NewMembership-events from Channels.");
            }

            // Will be routed to the member agent
            return [newMembership.memberId];
        }
        else if (event._$schemaId == SchemaTypes.NewEntry_1_0_0)
        {
            const newEntry = <NewEntry_1_0_0>event;
            // Will be routed to the owner of the group as well to all members (except entry owner)
            const group = await this._groupRepo.findGroupById(newEntry.groupId);
            if (!group)
            {
                throw new Error("Cannot find a group with id " + newEntry.groupId)
            }
            return [group.owner].concat(group.members.map(o => o.memberId));
        }
        else if (event._$schemaId == SchemaTypes.GroupClosed_1_0_0)
        {
            const groupClosed = <GroupClosed_1_0_0>event;
            // Notify the owner and all members
            return [groupClosed.groupOwner].concat(groupClosed.members);
        }

        Log.error("EventRouter", "Unknown event ", event);
        throw new Error("The EventRouter doesn't know about the event type that appeared previously in the log and therefore cannot route it.");
    }

    async getRecipients(event: SchemaType, stop: boolean): Promise<number[]>
    {
        // Filter all recipients without a valid session
        const distinctRecipients: { [id: number]: any } = {};
        (await this.getPossibleRecipients(event, stop))
            .forEach(o => distinctRecipients[o] = true);

        const recipientsWithoutSession = Object.keys(distinctRecipients)
            .filter(o => !this._sessionRepo.findSessionByOwner(parseInt(o)));

        if (recipientsWithoutSession?.length > 0)
        {
            console.warn("Trying to send the attached event to the following recipients which have no session: " + recipientsWithoutSession.join(", "), event);
        }

        const recipients = Object.keys(distinctRecipients)
            .map(o => parseInt(o))
            .filter(o => this._sessionRepo.findSessionByOwner(o));

        return recipients;
    }
}