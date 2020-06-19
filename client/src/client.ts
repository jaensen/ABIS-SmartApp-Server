import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {NewGroup_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newGroup_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {Log} from "@abis/log/dist/log";
import {NewMembership_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newMembership_1_0_0";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {from} from "ix/asynciterable";
import {filter} from "ix/asynciterable/operators";
import {Emitter} from "@abis/events/dist/emitter";
import {EventBroker} from "@abis/events/dist/eventBroker";
import {CreateChannel_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/createChannel_1_0_0";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {CreateEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/createEntry_1_0_0";
import {CloseChannel_1_0_0} from "@abis/types/dist/schemas/abis/types/events/commands/_generated/closeChannel_1_0_0";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";

export type EventFilter<TEvent extends SchemaType> = (e: TEvent) => boolean;

export class Client
{
    private readonly _proxy: ClientProxy;
    private _session?: Session_1_0_0;
    private _events?: Emitter<SchemaType>;
    private _clientEventBroker = new EventBroker();
    private _stopRequest =  false;

    constructor(proxy: ClientProxy)
    {
        this._proxy = proxy;
    }

    async connect()
    {
        if (this._session)
        {
            throw new Error("Already connected.");
        }

        this._session = await this._proxy.createAnonymousSession();
        this._events = this._proxy.subscribeTo(this._session.owner);

        this.run();
    }

    disconnect() {
        this._stopRequest = true;
    }

    private async run() {
        if (!this._events) {
            throw new Error("Call connect() first.")
        }
        for await(let event of this._events) {
            if (this._stopRequest) {
                this._stopRequest = false;
                break;
            }
            // Topic '0' always receives all events that the client receives
            await this._clientEventBroker.publishDirect(0, event);
        }
        Log.log("Client", "Stopped client");
    }

    private readonly _dialogs: { [withAgentId: number]: IDuplexChannel } = {};

    async newDialog(withAgentId: number, volatile:boolean, implementation:string)
    {
        if (!this._session) {
            throw new Error("Call connect() first.")
        }

        const impl = await import(implementation);

        const duplexChannel = await this.newDuplexChannel(withAgentId, volatile);
        const dialog = new impl.Class(duplexChannel, this._session.jwt);
        dialog.run();
        return dialog;
    }

    /**
     * Creates a new DuplexChannel between the current agent (identified by its session)
     * and the specified other agent.
     * @param withAgentId The other agent.
     */
    async newDuplexChannel(withAgentId:number, volatile:boolean)
    {
        if (!this._session?.jwt || !this._events)
        {
            throw new Error("Call connect() first.");
        }

        // Create out-channel
        const createOutChannel = <CreateChannel_1_0_0> {
            _$schemaId: SchemaTypes.CreateChannel_1_0_0,
            $jwt: this._session?.jwt,
            toAgentId: withAgentId,
            name: this._session.owner + " -> " + withAgentId,
            volatile: volatile
        };

        const self = this;

        return new Promise<IDuplexChannel>(async (resolve, reject) => {
            this.receive<NewGroup_1_0_0>(
                SchemaTypes.NewGroup_1_0_0,
                e => e.owner == this._session?.owner)
                .then(async createdOutChannel => {
                    Log.log("Client", "Created 'out' channel", createOutChannel);

                    const inChannelMembership = await this.receive<NewMembership_1_0_0>(
                        SchemaTypes.NewMembership_1_0_0,
                        e => e.memberId == this._session?.owner
                            && e.creatorId == withAgentId);

                    return {
                        createdOutChannel,
                        inChannelMembership
                    }
                })
                .then(previous => {
                    Log.log("Client", "Received 'in' channel membership", previous.inChannelMembership);

                    const allClientEvents = this._clientEventBroker.subscribe(0);
                    const inChannelEvents = from(allClientEvents)
                        .pipe(
                            filter((event:SchemaType) =>
                                event._$schemaId == SchemaTypes.NewEntry_1_0_0
                                && event.groupId == previous.inChannelMembership.groupId)
                        );

                    const duplexChannel = <IDuplexChannel>{
                        inChannelId: previous.inChannelMembership.groupId,
                        outChannelId: previous.createdOutChannel.id,
                        inChannelEvents: inChannelEvents,
                        ownAgentId: self._session?.owner,
                        partnerAgentId: withAgentId,
                        async send(name:string, data:SchemaType): Promise<NewEntry_1_0_0>
                        {
                            const createEntry = <CreateEntry_1_0_0>{
                                _$schemaId: SchemaTypes.CreateEntry_1_0_0,
                                $jwt: self._session?.jwt,
                                name: name,
                                inGroupId: previous.createdOutChannel.id,
                                data: data
                            };

                            await self.send(createEntry);

                            const response = await self.receive<NewEntry_1_0_0>(
                                SchemaTypes.NewEntry_1_0_0,
                                e => e.groupId == previous.createdOutChannel.id);

                            return response;
                        },
                        async close()
                        {
                            // Send a CloseChannel_1_0_0 message to my agent
                            await self.send(<CloseChannel_1_0_0> {
                                _$schemaId: SchemaTypes.CloseChannel_1_0_0,
                                $jwt: self._session?.jwt,
                                channelId: previous.createdOutChannel.id
                            });
                        }
                    };

                    Log.log("Client", "Created DuplexChannel", duplexChannel);

                    resolve(duplexChannel);
                });

            await this.send(createOutChannel);
        });
    }

    async send(event: SchemaType)
    {
        await this._proxy.publish(event);
    }

    /**
     * Waits for the specified event.
     * @param eventType A value of the SchemaType enumeration
     * @param eventFilter An optional filter predicate
     * @param timeoutMs An optional timeout (default: 10000 milliseconds. Supply a value smaller than 1 for infinite)
     */
    async receive<T extends SchemaType>(
        eventType: SchemaTypes,
        eventFilter: EventFilter<T> = (e) => true,
        timeoutMs: number = 10000): Promise<T>
    {
        const receivedEvent = new Promise<T>((async (resolve, reject) =>
        {
            if (!this._events)
            {
                reject(new Error("Call connect() first."));
                return;
            }

            const allEvents = this._clientEventBroker.subscribe(0);

            try
            {
                for await (let event of allEvents)
                {
                    if (event._$schemaId == eventType && eventFilter(<T>event)) {
                        resolve(<T>event);
                        return;
                    }
                }
            }
            catch (e)
            {
                Log.error("Client", "An error occurred while the client was waiting for an event:", e);
                reject(e);
            }
        }));

        try
        {
            const candidates = [ receivedEvent ];
            if (timeoutMs > 0) {
                candidates.push(this.newTimeout<T>(timeoutMs));
            }
            return await Promise.race(candidates);
        }
        catch (e)
        {
            // Todo: the 'rejected' Error object (should be 'e'?!) is not written to the log
            Log.error("Client", "An error occurred while the client was waiting for an event:", e);
            throw e;
        }
    }

    private newTimeout<T>(timeoutInMs: number)
    {
        return new Promise<T>(((resolve, reject) =>
        {
            setTimeout(
                () =>
                {
                    const error = new Error("The waiting operation timed out after " + timeoutInMs + " milliseconds.");
                    reject(error);
                },
                timeoutInMs);
        }));
    }
}