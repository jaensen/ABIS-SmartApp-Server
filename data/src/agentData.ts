import {GroupRepo} from "./groupRepo";
import {IAgentData, IClose, ICreate, IFindAgent, IFindGroup} from "@abis/interfaces/dist/agentData";
import {Agent_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/agent_1_0_0";
import {AgentRepo} from "./agentRepo";
import {SessionRepo} from "./sessionRepo";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {Group_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/group_1_0_0";
import {prisma} from "./prisma";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";

export class FindAgent implements IFindAgent
{
    private readonly _sessionRepo: SessionRepo;
    private readonly _agentRepo: AgentRepo;

    constructor(sessionRepo: SessionRepo, agentRepo: AgentRepo)
    {
        this._sessionRepo = sessionRepo;
        this._agentRepo = agentRepo;
    }

    async byJwt(jwt: string): Promise<Agent_1_0_0 | undefined>
    {
        const session = await this._sessionRepo.findSessionByJwt(jwt);
        if (!session?.owner)
            return undefined;

        const agent = await this._agentRepo.findAgentById(session.owner);
        if (!agent)
            return undefined;

        return <Agent_1_0_0>{
            _$schemaId: SchemaTypes.Agent_1_0_0,
            id: agent.id,
            name: agent.name,
            implementation: agent.implementation
        };
    }
}

export class FindGroup implements IFindGroup
{
    private readonly _parent: IAgentData;
    private readonly _groupRepos: GroupRepo;

    constructor(parent: IAgentData, groupRepos: GroupRepo)
    {
        this._parent = parent;
        this._groupRepos = groupRepos;
    }

    async byId(jwt: string, groupId: number): Promise<Group_1_0_0 | undefined>
    {
        const agent = await this._parent.findAgent.byJwt(jwt);
        if (!agent)
            return undefined;

        // Can see the group either:
        // .. when it is public
        // .. the agent owns the group
        // .. the agent is member of the group
        const foundGroup = await prisma.group.findOne({
            where: {
                id: groupId
            },
            include: {
                memberships: {
                    include: {
                        member: true
                    },
                    where: {
                        memberAgentId: agent.id
                    }
                }
            }
        });

        if (!foundGroup)
            return undefined; // TODO: Log warning

        if (foundGroup.ownerAgentId != agent.id
            && foundGroup.memberships.length == 0)
            return undefined; // TODO: Log warning

        if (foundGroup.ownerAgentId == agent.id) {
            return this._groupRepos.findGroupById(groupId);
        }

        return <Group_1_0_0>{
            _$schemaId: SchemaTypes.Group_1_0_0,
            id: foundGroup.id,
            createdAt: foundGroup.createdAt.toJSON(),
            name: foundGroup.name,
            type: foundGroup.type,
            owner: foundGroup.ownerAgentId,
            volatile: foundGroup.volatile
        }
    }
}

export class Close implements IClose
{
    private readonly _sessionRepo: SessionRepo;
    private readonly _agentRepo: AgentRepo;

    constructor(sessionRepo: SessionRepo, agentRepo: AgentRepo)
    {
        this._sessionRepo = sessionRepo;
        this._agentRepo = agentRepo;
    }

    channel(jwt: string, channelId: number): Promise<void>
    {
        throw new Error("Not implemented!");
    }
}

export class Create implements ICreate
{
    private readonly _parent: IAgentData;
    private readonly _groupRepos: GroupRepo;

    constructor(parent: IAgentData, groupRepos: GroupRepo)
    {
        this._parent = parent;
        this._groupRepos = groupRepos;
    }

    async channel(jwt: string, name: string, toAgentId: number, volatile: boolean): Promise<Group_1_0_0 & {
                addEntry: (jwt: string, name: string, data: SchemaType) => Promise<NewEntry_1_0_0>
            }>
    {
        const agent = await this._parent.findAgent.byJwt(jwt);
        if (!agent)
            throw new Error("Unauthorized")

        const channel = await this._groupRepos.createChannel(
            jwt,
            toAgentId,
            agent.id + " -> " + toAgentId,
            volatile);

        return {
            ...channel,
            addEntry: async (jwt: string, name: string, data: SchemaType) => {
                const newEntry = await channel.addEntry(jwt, name, data);
                return <NewEntry_1_0_0> {
                    _$schemaId: SchemaTypes.NewEntry_1_0_0,
                    id: newEntry.id,
                    name: newEntry.name,
                    owner: newEntry.owner,
                    groupId: newEntry.groupId,
                    data: newEntry.data
                };
            }
        };
    }
}

export class AgentData implements IAgentData
{
    private readonly _sessionRepo: SessionRepo;
    private readonly _agentRepo: AgentRepo;
    private readonly _groupRepo: GroupRepo;

    readonly findAgent: IFindAgent;
    readonly findGroup: IFindGroup;
    readonly close: IClose;
    readonly create: ICreate;

    constructor(sessionRepo: SessionRepo, agentRepo: AgentRepo, groupRepo: GroupRepo)
    {
        this._sessionRepo = sessionRepo;
        this._agentRepo = agentRepo;
        this._groupRepo = groupRepo;

        this.findAgent = new FindAgent(this._sessionRepo, this._agentRepo);
        this.findGroup = new FindGroup(this, this._groupRepo);
        this.create = new Create(this, this._groupRepo);
        this.close = new Close(this._sessionRepo, this._agentRepo);
    }
}
