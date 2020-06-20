import {Client, ClientProxy} from "./client";

export class Main
{
    async run()
    {
        const clientProxy = new ClientProxy("localhost:4000");
        await clientProxy.connect();

        const client = new Client(clientProxy);
        await client.connect();

        const authDialog = await client.newDialog(1, false, "./dialogs/authenticationDialog");
        authDialog.run();
    }
}

new Main().run();