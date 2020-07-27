# @abis/client
This package contains the client library for ABIS.  
The client library takes care of connection- and session-handling and runs custom _[dialogs](../dialog)_.

### Usage
  
```typescript
import {Client, ClientProxy} from "@abis/client";

// The proxy creates the connection and Session.
// When a Session was established, it provides a duplex channel to the Session's Agent.
const clientProxy = new ClientProxy("localhost:4000");
await clientProxy.connect();

// The client provides the ability to run dialogs on top of the proxy's channel.
const abisClient = new Client(clientProxy);
await abisClient.connect();

// When connected, query all systemAgents of the connected server
const server = await abisClient.myServer();
const systemAgents = await server.systemAgents();

// Look for the 'authentication' Agent
const authenticationAgent = systemAgents.find(o => o.name == "authentication");
if (!authenticationAgent) {
    throw new Error("Couldn't find the 'authentication' agent on the server.")
}

// Run the client side 'Sign-in', 'Verify Email' and 'Login' dialog.
// The dialog is specified in the given path (../dialogs/..). 
const dialog = await abisClient.newDialog(
    authenticationAgent.id
    , false
    , "../../apps/abis/client/dist/dialogs/authenticationDialog")
```
