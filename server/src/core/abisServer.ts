import {AdapterPublisher} from "@abis/events/dist/adapterPublisher";
import {UserRepo} from "@abis/data/dist/userRepo";
import {AgentRepo} from "@abis/data/dist/agentRepo";
import {SessionRepo} from "@abis/data/dist/sessionRepo";
import {GroupRepo} from "@abis/data/dist/groupRepo";
import {EventRouter} from "./eventRouter";
import {EventBroker} from "@abis/events/dist/eventBroker";
import {AgentFactory} from "./agentFactory";
import {AgentHost} from "./agentHost";
import {SystemHook} from "./systemHook";
import {Session} from "@abis/data/dist/types/session";
import {Emitter} from "@abis/events/dist/emitter";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {AgentData} from "@abis/data/dist/agentData";
import {Log} from "@abis/log/dist/log";
import {Agent} from "@abis/data/dist/types/agent";
import {Agent_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/agent_1_0_0";

export class AbisServer
{
    readonly eventPublisher = new AdapterPublisher();

    private readonly _userRepo = new UserRepo();
    private readonly _agentRepo = new AgentRepo(this._userRepo);
    private readonly _sessionRepo = new SessionRepo(this.eventPublisher, this._agentRepo);
    private readonly _groupRepo = new GroupRepo(this.eventPublisher, this._sessionRepo);

    readonly agentData = new AgentData(this._sessionRepo, this._agentRepo, this._groupRepo);

    private readonly _eventRouter = new EventRouter(this._sessionRepo, this._groupRepo);
    readonly eventBroker = new EventBroker(this._eventRouter);

    private readonly _agentFactory = new AgentFactory(this.eventBroker, this.eventPublisher, this._agentRepo, this.agentData);
    private readonly _agentHost = new AgentHost(this._agentFactory);

    get systemUsers() : { id: number, email: string }[]
    {
        return this._systemUsers;
    }
    private readonly _systemUsers: { id: number, email: string }[] = [];

    get systemAgents() : Agent_1_0_0[]
    {
        return this._systemAgents;
    }
    private readonly _systemAgents: Agent[] = [];

    constructor()
    {
        this.eventPublisher.target = new SystemHook(this._eventRouter, this.eventBroker, this._agentHost);
        Log.log("Server", "Created SystemHook and Server-instance.")
    }

    public async init()
    {
        Log.log("Server", "Started (run() called).");

        Log.log("Server", "Creating system users ..");
        const systemUser = await this._userRepo.ensureUserExists("system@abis.local");
        this._systemUsers.push({email: systemUser.email, id: systemUser.id});

        const anonUser = await this._userRepo.ensureUserExists("anon@abis.local");
        this._systemUsers.push({email: anonUser.email, id: anonUser.id});

        Log.log("Server", "Creating system agents ..")
        const authenticationAgent = await this._agentRepo.ensureSingletonAgentExists("authentication", "../apps/abis/dist/authenticationAgent");
        this._systemAgents.push(authenticationAgent);

        Log.log("Server", "Creating session for system agent '" + authenticationAgent.name + "' (id: " + authenticationAgent.id + ") ..");
        await this._sessionRepo.createSession(systemUser.id, authenticationAgent.id);
    }

    public async createAnonymousSession(): Promise<Session>
    {
        if (!this._userRepo.anonymousUserId)
        {
            throw new Error("The UserRepo wasn't initialized.")
        }

        // A new anonymous agent
        const anonSession = await this._sessionRepo.createSession(this._userRepo.anonymousUserId);
        return anonSession;
    }

    public subscribeTo(topicId: number): Emitter<SchemaType>
    {
        Log.log("Server", "subscribeTo(topicId: " + topicId + ")");
        return this.eventBroker.subscribe(topicId);
    }
}