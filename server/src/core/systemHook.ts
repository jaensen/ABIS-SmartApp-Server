import {AgentHost} from "./agentHost";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {IEventRouter} from "@abis/interfaces/dist/eventRouter";
import {Log} from "@abis/log/dist/log";

export class SystemHook implements IEventPublisher
{
    private readonly _agentHost:AgentHost;
    private readonly _eventPublisher:IEventPublisher;
    private readonly _eventRouter:IEventRouter;

    constructor(eventRouter:IEventRouter, eventPublisher:IEventPublisher, agentHost:AgentHost)
    {
        this._agentHost = agentHost;
        this._eventPublisher = eventPublisher;
        this._eventRouter = eventRouter;
    }

    async publish(event: SchemaType, stop:boolean = false)
    {
        let recipients = await this._eventRouter.getRecipients(event, stop);

        Log.log("SystemHook", "Ensure that agents '" + recipients.join(", ") + "' are loaded to receive '" + event._$schemaId + "' ..");

        await Promise.all(
            recipients.map(async recipientAgentId => {
                await this._agentHost.ensureAgentLoaded(recipientAgentId)
            }
        ));
        await this._eventPublisher.publish(event, stop);
    }
}