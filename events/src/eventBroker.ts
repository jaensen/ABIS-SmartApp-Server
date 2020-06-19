import {Emitter} from "./emitter";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IEventRouter} from "@abis/interfaces/src/eventRouter";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {Log} from "@abis/log/dist/log";

export class EventBroker implements IEventPublisher
{
    private readonly _subscriptions: { [topicId: number]: Emitter<SchemaType>[] } = {};

    private readonly _eventRouter?: IEventRouter;

    static instanceCount: number = 0;

    private readonly name: string;

    constructor(eventRouter?: IEventRouter)
    {
        this.name = "EventBroker:" + (++EventBroker.instanceCount);
        this._eventRouter = eventRouter;
    }

    subscribe(topicId: number): Emitter<SchemaType>
    {
        const newEmitter = new Emitter<SchemaType>("EventEmitter f. Agent:" + topicId.toString());

        let subs = this._subscriptions[topicId];
        if (!subs)
        {
            subs = [newEmitter];
        }
        else
        {
            subs.push(newEmitter);
        }
        this._subscriptions[topicId] = subs;

        return newEmitter;
    }

    async publishDirect(topicId: number, event: SchemaType, stop: boolean = false): Promise<void>
    {
        const listeners = this._subscriptions[topicId];
        if (!listeners || listeners.length == 0)
        {
            Log.unhandled(this.name, "publishDirect(topicId:" + topicId + ", event: " + event._$schemaId + ", stop: " + stop + ") -> no Emitter");
        }
        let i = 0;
        await Promise.all(listeners?.map(async o =>
        {
            await o.publish(event, stop)
        }) ?? []);
    }

    async publish(event: SchemaType, stop: boolean = false): Promise<void>
    {
        if (!this._eventRouter)
        {
            throw new Error("You can only use publishDirect() when no 'EventRouter' is set.")
        }
        const recipients = await this._eventRouter.getRecipients(event, stop);

        Log.log(this.name, "Sending event '" + event._$schemaId + "' to the following agents: " + recipients.join(", "), event);

        await Promise.all(recipients.map(async recipientAgentId =>
        {
            await this.publishDirect(recipientAgentId, event, stop)
        }));
    }
}