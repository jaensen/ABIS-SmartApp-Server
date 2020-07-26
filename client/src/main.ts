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

        const dialog = abisClient.newDialog(3, false, "../../apps/abis/client/dist/dialogs/authenticationDialog")
    }
    f();
}
