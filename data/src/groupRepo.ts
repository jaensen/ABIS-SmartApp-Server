import {SessionRepo} from "./sessionRepo";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {NewGroup_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newGroup_1_0_0";
import {GroupClosed_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/groupClosed_1_0_0";
import {prisma} from "./prisma";
import {Group} from "./types/group";
import {Membership} from "./types/membership";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";

export enum GroupType {
    Stash = "Stash",
    Channel = "Channel",
    Room = "Room",
    Share = "Share"
}

export class GroupRepo
{
    private readonly _eventPublisher:IEventPublisher;
    private readonly _sessionRepo:SessionRepo;

    constructor(eventPublisher:IEventPublisher, sessionRepo:SessionRepo)
    {
        this._eventPublisher = eventPublisher;
        this._sessionRepo = sessionRepo;
    }

    async findGroupById(groupId:number) : Promise<Group|undefined>
    {
        const group = await prisma.group.findOne({
            where: {
                id: groupId
            },
            include: {
                memberships: {
                    select: {
                        id: true,
                        memberAgentId: true,
                        groupId: true,
                        createdByAgentId: true
                    }
                }
            }
        });
        if (!group) {
            return undefined;
        }
        const newGroup = new Group(
            this._eventPublisher,
            this._sessionRepo,
            group.id,
            group.createdAt.toJSON(),
            <GroupType>group.type,
            group.ownerAgentId,
            group.name,
            group.volatile,
            group.memberships.map(m => new Membership(m.id, m.createdByAgentId, m.memberAgentId, m.groupId))
        );
        return newGroup;
    }

    async createChannel(jwt:string, memberAgentId:number, name:string, volatile:boolean) : Promise<Group>
    {
        const session = await this._sessionRepo.findSessionByJwt(jwt);
        if (!session) {
            throw new Error("Cannot find an agent for jwt " + jwt);
        }
        const newGroup = await prisma.group.create({
            data: {
                name: name,
                owner:{
                    connect:{
                        id:session.owner
                    }
                },
                createdBy:{
                    connect:{
                        id:session.owner
                    }
                },
                createdAt:new Date(),
                createdByRequestId: "-",
                volatile: volatile,
                type: "Channel",
                isPublic: false
            }
        });

        await this._eventPublisher.publish(<NewGroup_1_0_0>{
            _$schemaId: SchemaTypes.NewGroup_1_0_0,
            id: newGroup.id,
            members: [],
            name: newGroup.name,
            owner: newGroup.ownerAgentId,
            type: newGroup.type,
            volatile: newGroup.volatile
        });

        const returnValue = new Group(
            this._eventPublisher,
            this._sessionRepo,
            newGroup.id,
            newGroup.createdAt.toJSON(),
            GroupType.Channel,
            newGroup.ownerAgentId,
            newGroup.name,
            newGroup.volatile,
            []);

        await returnValue.addMember(jwt, memberAgentId);

        return returnValue;
    }

    async closeChannel(jwt: string, channelId: number)
    {
        const session = await this._sessionRepo.findSessionByJwt(jwt);
        if (!session)
            throw new Error("Couldn't find a valid session for jwt '" + jwt + "'");

        const groupToClose = await this.findGroupById(channelId);
        if(!groupToClose) {
            throw new Error("Couldn't find a group with id " + channelId + " to close.")
        }

        await prisma.group.update({
            where:{
                id: channelId
            },
            data:{
                updatedAt: new Date(),
                closedAt: new Date(),
                closedBy: {
                    connect:{
                        id: session.owner
                    }
                }
            }
        });

        await this._eventPublisher.publish(<GroupClosed_1_0_0>{
            _$schemaId: SchemaTypes.GroupClosed_1_0_0,
            groupId: groupToClose.id,
            groupOwner: groupToClose.owner,
            members: groupToClose.members.map(o => o.memberId)
        });
    }
}