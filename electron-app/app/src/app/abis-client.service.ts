import {Injectable} from '@angular/core';
import {Client, ClientProxy, SystemAgent} from "@abis/client/dist/client";
import {BehaviorSubject} from "rxjs";
import {Agent} from "@abis/client/dist/generated/abis-api";
import {Class} from "@abis/client/dist/dialogs/authenticationDialog";

@Injectable({
  providedIn: 'root'
})
export class AbisClientService {
  private readonly _clientProxy:ClientProxy;
  private readonly _abisClient:Client;

  readonly client:BehaviorSubject<Client>;
  readonly systemAgents:BehaviorSubject<SystemAgent[]>;
  readonly myProfile:BehaviorSubject<Agent>;
  readonly isAnonymous:BehaviorSubject<boolean>;

  constructor()
  {
    this.client = new BehaviorSubject<Client>(null);
    this.systemAgents = new BehaviorSubject<SystemAgent[]>([]);
    this.myProfile = new BehaviorSubject<Agent>(null);
    this.isAnonymous = new BehaviorSubject<boolean>(true);

    this._clientProxy = new ClientProxy("localhost:4000");
    this._abisClient = new Client(this._clientProxy);

    this._clientProxy.connect()
      .then(() => {
        return this._abisClient.connect();
      })
      .then(() => {
        console.log("Client connected.");
        this.client.next(this._abisClient);
      })
      .then(async () => {
        const myProfile = await this._abisClient.myProfile();

        this.myProfile.next(myProfile);
        this.isAnonymous.next(myProfile.name === "Anonymous");
      })
      .then(async () => {
        const server = await this._abisClient.myServer();
        const systemAgents = await server.systemAgents();
        this.systemAgents.next(systemAgents);
      });
  }

  newDialog(withAgentId:number, volatile:boolean, implementation: any)
  {
    return this._abisClient.newDialog(
      withAgentId
      , volatile
      , implementation);
  }
}
