import {AgentFactory} from "./agentFactory";
import {IRuntimeAgent} from "@abis/interfaces/dist/runtimeAgent";
import {Log} from "@abis/log/dist/log";

export class AgentHost
{
    private readonly _agentFactory:AgentFactory;
    private readonly _agents: {
        [agentId:number]: IRuntimeAgent | { resolve:() => void, reject:(error:any) => void }[]
    } = {};

    constructor(agentFactory:AgentFactory)
    {
        this._agentFactory = agentFactory;
    }

    async ensureAgentLoaded(agentId: number) : Promise<void>
    {
        const existing = this._agents[agentId];
        if (existing)
        {
            if (Array.isArray(existing))
            {
                // Has a waiting list. Add this request to the waiting list.
                Log.log("AgentHost", "Adding request for agent " + agentId + " to the wait list.");
                return new Promise((resolve, reject) =>
                {
                    existing.push({
                        resolve,
                        reject
                    });
                });
            }

            // Already exists
            Log.log("AgentHost", "Agent " + agentId + " already loaded");
            return;
        }

        // Create a new waiting list for other requests
        this._agents[agentId] = [];

        const waiting = this._agents[agentId];
        try
        {
            Log.log("AgentHost", "Loading agent " + agentId);
            // Create the new agent and start it
            const agent = await this._agentFactory.create(agentId);
            agent.run(); // Don't await agent.run() because it loops 'forever'

            // Store the instance
            this._agents[agentId] = agent;

            if (Array.isArray(waiting))
            {
                // Resume waiting requests
                waiting.forEach(w => w.resolve());
            }
            Log.log("AgentHost", "Loaded agent " + agentId);
        }
        catch (e)
        {
            if (Array.isArray(waiting))
            {
                // Cancel waiting requests
                waiting.forEach(w => w.reject(e));
            }
            throw e;
        }
    }
}