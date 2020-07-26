import {Client, ClientProxy} from "./client";

export const isBrowser = typeof window !== "undefined";

if (isBrowser) {
    (<any>window).abisClient = new Promise<Client>(async (resolve, reject) => {
        const clientProxy = new ClientProxy("localhost:4000");
        await clientProxy.connect();

        const abisClient = new Client(clientProxy);
        await abisClient.connect();

        resolve(abisClient);
    });
} else {
    const f = async () => {
        const clientProxy = new ClientProxy("localhost:4000");
        await clientProxy.connect();

        const abisClient = new Client(clientProxy);
        await abisClient.connect();

        const server = await abisClient.myServer();
        const systemAgents = await server.systemAgents();

        const authenticationAgent = systemAgents.find(o => o.name == "authentication");
        if (!authenticationAgent) {
            throw new Error("Couldn't find the 'authentication' agent on the server.")
        }

        const dialog = await abisClient.newDialog(
            authenticationAgent.id
            , false
            , "../../apps/abis/client/dist/dialogs/authenticationDialog")
    }
    f();
}
