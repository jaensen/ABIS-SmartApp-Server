import {prisma} from "./prisma";
import {AgentType} from "@prisma/client";
import {UserRepo} from "./userRepo";
import {Agent} from "./types/agent";
import {Log} from "@abis/log/dist/log";

export class AgentRepo {
    private readonly _userRepo:UserRepo

    constructor(userRepo:UserRepo)
    {
        this._userRepo = userRepo;
    }

    async findAgentById(knownAgentId: number)
    {
        const agent = await prisma.agent.findOne({
            where: {
                id: knownAgentId
            }
        });
        if (!agent) {
            return undefined;
        }
        return <Agent> {
            id: agent.id,
            name: agent.name,
            implementation: agent.implementation
        }
    }

    async findAgentByName(userId:number, name: string)
    {
        const agents = await prisma.agent.findMany({
            where: {
                name: name,
                ownerUserId: userId
            }
        });
        if (agents.length != 1) {
            const msg = "Found " + agents.length + " agents for user " + userId + " with name '" + name + "'. Expected 1.";
            if (agents.length > 1) {
                Log.error("AgentRepo", msg);
                throw new Error(msg);
            } else {
                Log.log("AgentRepo", msg);
                return undefined;
            }
        }
        return <Agent> {
            id: agents[0].id,
            name: agents[0].name,
            implementation: agents[0].implementation
        }
    }

    async createAnonymousAgent()
    {
        if (!this._userRepo.anonymousUserId) {
            throw new Error("The UserRepo wasn't initialized.")
        }

        const implementation = "./agents/profileAgent";
        const name = "Anonymous";
        const anonAgent = await AgentRepo._createAgent(this._userRepo.anonymousUserId, name, implementation);

        Log.log("AgentRepo", "Created new anonymous agent '" + anonAgent.name + "' with implementation '" + anonAgent.implementation +"'.");

        return anonAgent;
    }

    async ensureSingletonAgentExists(name: string, implementation: string)
    {
        if (!this._userRepo.systemUserId) {
            throw new Error("The UserRepo wasn't initialized.")
        }

        Log.log("AgentRepo", "Ensuring that agent '" + name + "' with implementation '" + implementation +"' exists ..");
        let existing = await this.findAgentByName(this._userRepo.systemUserId, name);
        if (!existing)
        {
            existing = await AgentRepo._createAgent(this._userRepo.systemUserId, name, implementation);
            if (!existing) {
                throw new Error("Creation of agent '" + name + "' failed.");
            }
            Log.log("AgentRepo", "Agent '" + name + "' with implementation '" + implementation +"' was created (id: " + existing.id + ").");
        } else {
            Log.log("AgentRepo", "Agent '" + name + "' already exists (id: " + existing.id + ").");
        }
        return existing;
    }

    private static async _createAgent(ownerUserId: number, name: string, implementation: string)
    {
        const agent = await prisma.agent.create({
            data: {
                type: AgentType.Profile,
                createdByRequestId: "", // TODO: RequestID
                implementation: implementation,
                name: name,
                createdBy: {
                    connect: {
                        id: ownerUserId
                    }
                },
                owner: {
                    connect: {
                        id: ownerUserId
                    }
                }
            }
        });
        return <Agent>{
            id: agent.id,
            name: agent.name,
            implementation: agent.implementation
        };
    }
}