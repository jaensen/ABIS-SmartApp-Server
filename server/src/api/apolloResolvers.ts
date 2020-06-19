import {Agent, QueryResolvers, SubscriptionResolvers} from "../generated/graphql";
import {AbisServer} from "../core/abisServer";
import {ConnectionContext} from "./connectionContext";
import {Log} from "@abis/log/dist/log";

export class ApolloResolvers
{
    readonly subscriptionResolvers: SubscriptionResolvers;
    readonly queryResolvers: QueryResolvers;

    constructor(abisServer:AbisServer)
    {
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

                    return abisServer.eventBroker.subscribe(agent.id);
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
            }
        }
    }
}