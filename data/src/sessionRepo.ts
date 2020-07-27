import {AgentRepo} from "./agentRepo";
import {NewSession_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newSession_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {prisma} from "./prisma";
import {Session} from "./types/session";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {Log} from "@abis/log/dist/log";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {Helper} from "@abis/node-helper/dist/helper";

export class SessionRepo
{
    private readonly _eventPublisher:IEventPublisher;
    private readonly _agents: AgentRepo;

    constructor(eventPublisher:IEventPublisher, agents: AgentRepo)
    {
        this._eventPublisher = eventPublisher;
        this._agents = agents;
    }

    async findSessionByJwt(jwt:string) :Promise<Session_1_0_0|undefined>
    {
        try
        {
            const jwtData = await Helper.sessionFromJwt(jwt);
            const session = await prisma.session.findOne({
                where: {
                    id: jwtData.id
                }
            });

            if (!session)
                return undefined; // TODO: Log warning

            const now = new Date();
            if (session.validTo <= now || session.loggedOutAt || session.timedOutAt || session.revokedAt)
                return undefined; // TODO: Log warning

            return <Session_1_0_0> {
                _$schemaId: SchemaTypes.Session_1_0_0,
                id: session.id,
                createdAt: session.createdAt.toJSON(),
                timezoneOffset: session.timezoneOffset,
                owner: session.agentId,
                validTo: session.validTo.toJSON(),
                jwt: jwt
            };
        }
        catch (e)
        {
            Log.warning("SessionRepo", "Tried to find a session with an invalid jwt:", jwt);
            return undefined;
        }
    }

    async findSessionByOwner(owner:number) : Promise<Session|undefined>
    {
        const now = new Date();
        const sessions = await prisma.session.findMany({
            where: {
                agentId: owner,
                loggedOutAt: null,
                revokedAt: null,
                timedOutAt: null,
                validTo: {
                    gt: now
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 1
        });
        if (sessions.length != 1) {
            return undefined;
        }
        return <Session>{
            jwt: "no-jwt",
            owner: sessions[0].agentId
        };
    }

    async createSession(userId:number, knownAgentId?:number) : Promise<Session>
    {
        if (!knownAgentId)
        {
            const anonAgent = await this._agents.createAnonymousAgent();
            knownAgentId = anonAgent.id;
            Log.log("SessionRepo", "Creating a new anonymous session (ownerId: " + anonAgent.id + ")");
        }
        else
        {
            const knownAgent = await this._agents.findAgentById(knownAgentId);
            if (!knownAgent) {
                throw new Error("Trying to create a session for a non-existing agent (id: " + knownAgentId + ").");
            }
            Log.log("SessionRepo", "Creating a new session for known agent: " + knownAgentId);
        }

        const newSession = await prisma.session.create({
            data: {
                user:{
                    connect: {
                        id:userId
                    }
                },
                agent: {
                    connect: {
                        id: knownAgentId
                    }
                },
                createdAt: new Date(),
                validTo: new Date(new Date().getTime() + (24 * 60 * 60 * 60 * 1000)),
                createdByRequestId: "-"
            }
        });

        const jwt = Helper.sessionToJwt(<Session_1_0_0> {
            _$schemaId: SchemaTypes.Session_1_0_0,
            id: newSession.id,
            createdAt: newSession.createdAt.toJSON(),
            timezoneOffset: newSession.timezoneOffset,
            owner: newSession.agentId,
            validTo: newSession.validTo.toJSON()
        });

        await this._eventPublisher.publish(<NewSession_1_0_0>{
            _$schemaId: SchemaTypes.NewSession_1_0_0,
            jwt: jwt,
            owner: newSession.agentId
        });

        return new Session(this._eventPublisher, newSession.id, newSession.agentId, jwt, newSession.createdAt.toJSON());
    }
}
