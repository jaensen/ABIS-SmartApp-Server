import { Component } from '@angular/core';
import {Client, ClientProxy} from "@abis/client/dist/client";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  async f() {
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

  constructor()
  {
    this.f();
  }
}
