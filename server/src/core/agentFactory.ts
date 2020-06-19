import {AgentRepo} from "@abis/data/dist/agentRepo";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {EventBroker} from "@abis/events/dist/eventBroker";
import {IRuntimeAgent} from "@abis/interfaces/dist/runtimeAgent";
import {IAgentData} from "@abis/interfaces/dist/agentData";

export class AgentFactory
{
    private readonly _eventBroker:EventBroker;
    private readonly _eventPublisher:IEventPublisher;
    private readonly _agentData:AgentRepo;
    private readonly _repos:IAgentData;

    constructor(eventBroker:EventBroker, eventPublisher:IEventPublisher, agentData:AgentRepo, repos:IAgentData)
    {
        this._eventBroker = eventBroker;
        this._eventPublisher = eventPublisher;
        this._agentData = agentData;
        this._repos = repos;
    }

    async create(agentId:number) : Promise<IRuntimeAgent>
    {
        // Create a subscription for the new agent
        const agentEmitter = this._eventBroker.subscribe(agentId);

        const agent = await this._agentData.findAgentById(agentId);
        if (!agent)  {
            throw new Error("Trying to create a instance of the non-existing agent " + agentId);
        }

        // Load the implementation from a file ..
        const agentImplementation = await import(agent.implementation);

        // .. and create a instance from it
        return new agentImplementation.Class(agentId, agentEmitter, this._eventPublisher, this._repos);
    }
}