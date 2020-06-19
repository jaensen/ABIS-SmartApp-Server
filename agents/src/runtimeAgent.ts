import {IRuntimeAgent} from "@abis/interfaces/dist/runtimeAgent";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Log} from "@abis/log/dist/log";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {NewSession_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newSession_1_0_0";
import {IAgentData} from "@abis/interfaces/dist/agentData";

export abstract class RuntimeAgent implements IRuntimeAgent
{
    readonly events: AsyncIterable<SchemaType>;
    readonly eventPublisher: IEventPublisher;
    readonly data: IAgentData;

    get session():Session_1_0_0
    {
        return this._session;
    }
    private _session: Session_1_0_0;
    private _stopRequest = false;

    protected constructor(agentId: number, events: AsyncIterable<SchemaType>, eventPublisher: IEventPublisher, data: IAgentData)
    {
        this._session = <Session_1_0_0>{
            _$schemaId: SchemaTypes.Session_1_0_0,
            owner: agentId,
            jwt: "no-token"
        };
        this.events = events;
        this.eventPublisher = eventPublisher;
        this.data = data;
    }

    protected abstract async onEvent(event: SchemaType): Promise<void>;

    async stop(): Promise<void>
    {
        this._stopRequest = true;
    }

    async run(): Promise<void>
    {
        Log.log("RuntimeAgent:" + this.session.owner, "Started agent");
        let initialized = false;

        for await (let event of this.events)
        {
            if (this._stopRequest)
            {
                this._stopRequest = false;
                break;
            }
            if (event._$schemaId == SchemaTypes.NewSession_1_0_0)
            {
                const newSession = <NewSession_1_0_0>event;

                Log.log("RuntimeAgent:" + this.session.owner, "Received a new session (ownerId: " + newSession.owner + ", jwt:hidden).");

                this._session = <Session_1_0_0> {
                    _$schemaId: SchemaTypes.Session_1_0_0,
                    owner: newSession.owner,
                    jwt: newSession.jwt
                };

                Log.log("RuntimeAgent:" + this.session.owner, "New session was set (ownerId: " + newSession.owner + ", jwt:hidden).");

                initialized = true;
                continue;
            }

            if (!initialized)
            {
                throw new Error("The first message that a new agent instance must receive, is a 'NewSession' message.");
            }

            await this.onEvent(event);
        }

        Log.log("RuntimeAgent:" + this.session.owner, "Stopped agent");
    }
}