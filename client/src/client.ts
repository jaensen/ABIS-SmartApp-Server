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
import {ApolloLink, split} from "apollo-link";
import ApolloClient, {DefaultOptions} from "apollo-client";
import {InMemoryCache, NormalizedCacheObject} from "apollo-cache-inmemory";
import {HttpLink} from "apollo-link-http";
import {WebSocketLink} from "apollo-link-ws";
import {getMainDefinition} from 'apollo-utilities';
import ws from "ws";
import {fetch} from 'cross-fetch'
import {Helper} from "@abis/interfaces/dist/helper";
import {
    createSession,
    createSessionMutation,
    createSessionMutationVariables, Exact,
    NewEvent,
    NewEventSubscriptionVariables, Send, SendMutation, SendMutationVariables
} from "./generated/abis-api";

export type EventFilter<TEvent extends SchemaType> = (e: TEvent) => boolean;

export class ClientProxy
{
    private readonly _host: string;
    private readonly _defaultOptions: DefaultOptions;

    private _link?: ApolloLink;
    private _client?: ApolloClient<NormalizedCacheObject>;
    private _session?: Session_1_0_0;
    private _initialized = false;
    private _eventsSubscription?: ZenObservable.Subscription;

    private _clientEventBroker = new EventBroker();

    private get client(): ApolloClient<NormalizedCacheObject>
    {
        if (!this._client)
            throw new Error("Call connect() first!");

        return this._client;
    }

    public get session(): Session_1_0_0
    {
        if (!this._session)
            throw new Error("Call connect() first!");

        return this._session;
    }

    public constructor(host: string)
    {
        this._host = host;

        this._defaultOptions = {
            watchQuery: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'ignore',
            },
            query: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
        };
    }

    public async connect()
    {
        const now = new Date();

        if (this._initialized && this._client && (this._session?.validTo ?? now) > now)
        {
            // Session still valid
            console.warn("Called connect() while the current session is still valid.")
            return;
        }

        const httpLink = new HttpLink({
            fetch: fetch,
            uri: 'http://' + this._host,
            headers: {
                authorization: this._session?.jwt
            }
        });

        const connectionParams = {
            authorization: this._session?.jwt,
            clientTimezoneOffset: new Date().getTimezoneOffset()
        };

        const subscriptionLink = new WebSocketLink({
            webSocketImpl: window ? WebSocket :  ws,
            uri: 'ws://' + this._host + '/graphql',
            options: {
                reconnect: true,
                connectionParams: connectionParams
            }
        });

        this._link = split(
            ({query}) =>
            {
                const {kind, operation} = <any>getMainDefinition(query);
                return kind === 'OperationDefinition' && operation === 'subscription';
            },
            subscriptionLink,
            httpLink
        );

        this._client = new ApolloClient({
            link: this._link,
            cache: new InMemoryCache(),
            defaultOptions: this._defaultOptions
        });

        if (this._session !== undefined)
        {
            await this.subscribeToEvents();

            this._initialized = true;
            console.log("Connected. Token is: " + this._session?.jwt);
            return;
        }

        this._session = await this.createSession();
        console.log("Got the session. Initializing an authorized connection.");

        await this.connect();
    }

    private async subscribeToEvents()
    {
        if (!this._session)
            throw new Error("No session. Call connect() first.");

        const session = this._session;

        return new Promise<void>((resolve, reject) =>
        {
            this._eventsSubscription = this.client.subscribe<NewEventSubscriptionVariables>({
                query: NewEvent
            }).subscribe(next =>
            {
                const newEvent = <SchemaType>(<any>next.data).newEntry;
                this._clientEventBroker.publishDirect(session.owner, newEvent);
            });

            resolve();
        });
    }

    private async createSession() : Promise<Session_1_0_0>
    {
        if (!this._client)
            throw new Error("Call connect() first.");

        const session = await this._client.mutate<createSessionMutation, createSessionMutationVariables>({
            mutation: createSession
        });

        if (!session.data?.createSession.success)
        {
            throw new Error("Couldn't create a session at " + this._host);
        }

        return await Helper.sessionFromJwt(session.data.createSession.jwt);
    }

    subscribeTo()
    {
        if (!this._session)
            throw new Error("Call connect() first.");

        return this._clientEventBroker.subscribe(this._session.owner);
    }

    async publish(event: SchemaType)
    {
        if (!this._client)
            throw new Error("Call connect() first.");

        const result = await this._client.mutate<SendMutation, SendMutationVariables>({
            mutation: Send,
            variables: {
                event: event
            }
        });

        if (!result.data?.send?.success)
        {
            throw new Error("Couldn't send event: " + event._$schemaId);
        }
    }
}

export class Client
{
    private readonly _proxy: ClientProxy;
    private _session?: Session_1_0_0;
    private _events?: Emitter<SchemaType>;
    private _clientEventBroker = new EventBroker();
    private _stopRequest = false;

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

        this._session = this._proxy.session;
        this._events = this._proxy.subscribeTo();

        this.run();
    }

    disconnect()
    {
        this._stopRequest = true;
    }

    private async run()
    {
        if (!this._events)
        {
            throw new Error("Call connect() first.")
        }
        for await(let event of this._events)
        {
            if (this._stopRequest)
            {
                this._stopRequest = false;
                break;
            }
            // Topic '0' always receives all events that the client receives
            await this._clientEventBroker.publishDirect(0, event);
        }
        Log.log("Client", "Stopped client");
    }

    private readonly _dialogs: { [withAgentId: number]: IDuplexChannel } = {};

    async newDialog(withAgentId: number, volatile: boolean, implementation: string)
    {
        if (!this._session)
        {
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
    async newDuplexChannel(withAgentId: number, volatile: boolean)
    {
        if (!this._session?.jwt || !this._events)
        {
            throw new Error("Call connect() first.");
        }

        // Create out-channel
        const createOutChannel = <CreateChannel_1_0_0>{
            _$schemaId: SchemaTypes.CreateChannel_1_0_0,
            $jwt: this._session?.jwt,
            toAgentId: withAgentId,
            name: this._session.owner + " -> " + withAgentId,
            volatile: volatile
        };

        const self = this;

        return new Promise<IDuplexChannel>(async (resolve, reject) =>
        {
            this.receive<NewGroup_1_0_0>(
                SchemaTypes.NewGroup_1_0_0,
                e => e.owner == this._session?.owner)
                .then(async createdOutChannel =>
                {
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
                .then(previous =>
                {
                    Log.log("Client", "Received 'in' channel membership", previous.inChannelMembership);

                    const allClientEvents = this._clientEventBroker.subscribe(0);
                    const inChannelEvents = from(allClientEvents)
                        .pipe(
                            filter((event: SchemaType) =>
                                event._$schemaId == SchemaTypes.NewEntry_1_0_0
                                && event.groupId == previous.inChannelMembership.groupId)
                        );

                    const duplexChannel = <IDuplexChannel>{
                        inChannelId: previous.inChannelMembership.groupId,
                        outChannelId: previous.createdOutChannel.id,
                        inChannelEvents: inChannelEvents,
                        ownAgentId: self._session?.owner,
                        partnerAgentId: withAgentId,
                        async send(name: string, data: SchemaType): Promise<NewEntry_1_0_0>
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
                            await self.send(<CloseChannel_1_0_0>{
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
                    if (event._$schemaId == eventType && eventFilter(<T>event))
                    {
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
            const candidates = [receivedEvent];
            if (timeoutMs > 0)
            {
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