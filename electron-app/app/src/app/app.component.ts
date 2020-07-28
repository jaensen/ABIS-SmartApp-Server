import { Component } from '@angular/core';
import {Client, SystemAgent} from "@abis/client/dist/client";
import {Class} from "@abis/client/dist/dialogs/authenticationDialog";
import {AbisClientService} from "./abis-client.service";
import {Agent} from "@abis/client/dist/generated/abis-api";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  private _client:Client;
  private _systemAgents:SystemAgent[];
  private _myProfile:Agent;

  constructor(private abisClient:AbisClientService)
  {
    // TODO: Find a way to bundle that subscriptions
    const self = this;
    this.abisClient.client.subscribe(async next => {
      if (!next) return;

      this._client = next;
      await this.init(this._client, this._myProfile, this._systemAgents);
    });
    this.abisClient.systemAgents.subscribe(async next => {
      if (next.length == 0) return;

      this._systemAgents = next;
      await this.init(this._client, this._myProfile, this._systemAgents);
    });
    this.abisClient.myProfile.subscribe(async next => {
      if (!next) return;

      this._myProfile = next;
      await this.init(this._client, this._myProfile, this._systemAgents);
    });
  }

  async init(client:Client, myProfile:Agent, agents:SystemAgent[])
  {
    if (!client || !myProfile || !agents || agents.length == 0) {
      return;
    }

    const authenticationAgent = agents.find(o => o.name == "authentication");
    if (!authenticationAgent) {
      throw new Error("Couldn't find the 'authentication' agent on the server.")
    }

    const dialog = await this.abisClient.newDialog(
      authenticationAgent.id
      , false
      , Class);

    dialog.run().then(r => console.log("Auth dialog finished."));
  }
}
