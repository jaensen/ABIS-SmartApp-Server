import {
    Agent,
    CreateSessionResponse,
    MutationResolvers,
    QueryResolvers,
    SendResponse,
    SubscriptionResolvers
} from "../generated/graphql";
import {AbisServer} from "../core/abisServer";
import {ConnectionContext} from "./connectionContext";
import {Log} from "@abis/log/dist/log";
import { from } from 'ix/asynciterable';
import { filter, map } from 'ix/asynciterable/operators';

export class ApolloResolvers
{
    readonly subscriptionResolvers: SubscriptionResolvers;
    readonly queryResolvers: QueryResolvers;
    readonly mutationResolvers: MutationResolvers;

    constructor(abisServer:AbisServer)
    {
        this.mutationResolvers = {
            send:async  (parent, {event}, context: ConnectionContext) =>
            {
                await abisServer.eventPublisher.publish(event);

                return <SendResponse> {
                    success: true
                };
            },
            createSession: async (parent, args, context) =>
            {
                const anonymousSession = await abisServer.createSession();
                return <CreateSessionResponse>{
                    success: true,
                    jwt: anonymousSession.jwt
                }
            }
        };

        this.subscriptionResolvers = {
            event: {
                // @ts-ignore
                subscribe: async (parent: any, args: any, context: ConnectionContext) =>
                {
                    if (!context.jwt)
                        throw new Error("No jwt was supplied.");

                    const agent = await abisServer.agentData.findAgent.byJwt(context.jwt);
                    if (!agent)
                        throw new Error("Unauthorized");

                    Log.log("SubscriptionResolvers", "New subscriber:", agent);

                    const iterator = abisServer.eventBroker.subscribe(agent.id);

                    const wrapped = from(iterator).pipe(map(o => {
                        return {
                            event: o
                        }
                    }))

                    return wrapped;
                }
            }
        };

        this.queryResolvers = {
            myServer: async (parent: any, args: any, context: ConnectionContext) =>
            {
                if (!context.jwt)
                    throw new Error("No jwt was supplied.");

                const agent = await abisServer.agentData.findAgent.byJwt(context.jwt);
                if (!agent)
                    throw new Error("Unauthorized");

                return {
                    timezoneOffset: new Date().getTimezoneOffset(),
                    systemAgents: abisServer.systemAgents.map(a => {
                        return <Agent>{
                            id: a.id,
                            name: a.name,
                            createdAt: a.createdAt,
                            type: a.type,
                            timezoneOffset: a.timezoneOffset
                        }
                    })
                };
            },
            myProfile: async (parent: any, args: any, context: ConnectionContext) =>
            {
                if (!context.jwt)
                    throw new Error("No jwt was supplied.");

                const agent = await abisServer.agentData.findAgent.byJwt(context.jwt);
                if (!agent)
                    throw new Error("Unauthorized");

                return <Agent>{
                    id: agent.id,
                    name: agent.name,
                    createdAt: agent.createdAt,
                    type: agent.type,
                    timezoneOffset: agent.timezoneOffset
                }
            }
        }
    }
}
