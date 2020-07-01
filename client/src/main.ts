import {Client, ClientProxy} from "./client";

export class Main
{
    async run()
    {
        (<any>window).abisClientProxy = new ClientProxy("localhost:4000");
        await (<any>window).abisClientProxy.connect();


        (<any>window).abis = new Client((<any>window).abisClientProxy);
        await (<any>window).abis.connect();

        const authDialog = await (<any>window).abis.newDialog(1, false, "./dialogs/authenticationDialog");
        authDialog.run();
    }
}


new Main().run();