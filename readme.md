# ABIS Server
This repository contains the server component of abis. The server provides a GraphQL-API and comes with a client library.  
It is based on [Apollo Server](https://www.apollographql.com/docs/apollo-server/) and [Prisma 2](https://www.prisma.io/).

## Quickstart
**1) Clone the repository:**  
```
$ git clone https://github.com/ABISCloud/ABIS-OS1-Gamma.git
```
**2) Adjust the database config**  
  
Provide your own connection string in _data/src/schema.prisma_:
```  
datasource db {
    provider = "postgresql"
    url      = "postgresql://postgres:abis@localhost:5432/abis?schema=public"
}
```
**3) Install dependencies, generate code and build:**
```  
$ cd ABIS-OS1-Gamma
$ ./clean.sh
```
**4) Deploy the database** 
  
Use the prisma command line utility to deploy the database to your server (this uses the configuration from _data/src/schema.prisma_).
```  
$ cd data/src
$ npx prisma migrate save --experimental
$ npx prisma migrate up --experimental
```
**5) Run the server**
```  
$ cd server
$ node dist/main.js
```
**6) Generate the client code**
```  
$ cd client
$ npm run generate
```

## What is it?
It is basically an application server that tries to address many requirements of modern, collaborative web applications. As there are:  
  
**..** Authentication and authorization  
**..** Notifications and group-chat  
**..** Forms  
**..** Workflows  
**..** ...  

It provides all of its services via an application-agnostic GraphQL API. In contrast to many other Web-APIs, it doesn't use resource-addresses and verbs (e.g. REST) or RPC, but instead uses message passing and events (pub/sub) as its main mode of interaction. 

It does this to keep the API application-agnostic (many different applications can be created with the same API primitives).
Further, all messages that are passed, are described by a JsonSchema. The schemas are used by the client, as well as by the server to generate UI, code and other things. Every application can bring their own schemas.

To simplify the implementation of common taks and processes, _Channels_ and _Dialogs_ are provided.
Channels are one-on-one chats and _Dialogs_ are state-machines or workflows that run on top of them.  

### Priciples

**Agents, Groups and Messages/Entries**  
  
To achieve all of that, while keeping the server and API minimal, all users of the system (human or not) 
are modelled as _Agents_ which collaborate together in _Groups_ and exchange messages.    

Before any interaction, the client must therefore acquire a _Session_, which in turn will create a new anonymous 
_Agent_ that represents this client as long as it didn't authenticate.

Equipped with a _Session_ and _Agent_, the client can now explore the server (_myServer_-query), create own groups and post to groups of which it is a member.
Other agents will be notified about any action if it concerns them (e.g.: if the action took place in a common group).
 
**Group types**  
There are different types of Groups. They differ mostly in their number of members and visibility:
* Stash  
_A Stash has no _Members_. Only the owner-_Agent_ has access to it. Stashes are always 'private'.   
They are used by an Agent to store private data of any kind._  
* Channel  
_A Channel has exactly one _Member_. Only the owner can write to it, the member can read. Channels are always 'private'.  
They are used either for a person to person chat or as carrier for application protocols._
* Room  
_A Room has many _Members_. All members can read and write. Rooms can be 'public' or 'private'.  
They are used whenever multiple Agents need to colloborate with each other._
* Share  
_A Share has no _Members_ but everyone can read it (always public). Only the owner can write to it.  
They are used as a way to announce things or to provide shared resources to many agents._

**Message Ping-Pong**  
Every service (like authentication, custom workflows etc.) is provided by an Agent. 
Some of them are system-wide known 'Singleton'-_Agents_ (which are created by the system and are accessible via the "myServer"-query), 
others are "Profiles" (Agents that represent a user) or "Companions" (Agents that accompany other objects such as Groups or Entries). 
  
No matter the type, all Agents subscribe to the event system when they're created and thus are reachable via messages.
To utilize the services of an Agent, a new Channel must be created. The addressed Agent will be notified about this connection attempt. 
It can then react to it and either create a new reverse channel (so that a duplex channel is formed) or simply by ignoring the request (TODO: Add "reject" as well).

When a _DuplexChannel_ is established between the Agents, they can exchange messages at will. When the message exchange is complete, the channel
must be closed. This is important because there can be only one open channel between two parties at the same time.  


## Repository structure
The repository contains multiple npm-packages. Each package has its own readme file.
* __@abis/server__:  
Contains the Apollo Server based NodeJS application.  
  * _Readme: [server/readme.md](server/readme.md)_
  * _Uses: @abis/types, @abis/interfaces, @abis/events, @abis/data, @abis/log_
* __@abis/client__:  
Contains the client library for the use in client applications.  
  * _Readme: [client/readme.md](client/readme.md)_
  * _Uses: @abis/types, @abis/interfaces, @abis/dialog, @abis/events, @abis/log_
* __@abis/types__:  
Contains a collection of JsonSchema documents and corresponding TypeScript interfaces that describe e.g. all events that are used troughout the system.
  * _Uses: -_ 
* __@abis/interfaces__:  
Contains all common interfaces.
  * _Uses: @abis/types_
* __@abis/events__:  
Contains the event delivery mechanism that is used for _Agents_ and _Dialogs_
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
* __@abis/agents__:  
Contains the base agent types from which other implementors can derive.
  * _Uses: @abis/types, @abis/interfaces, @abis/dialog, @abis/events, @abis/log, @abis/data_
* __@abis/dialog__:  
Contains mechanisms to describe a Dialog between two Agents as a State-Machine and a runtime to execute these descriptions.
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
* __@abis/data__:  
Contains classes that provide access to the _Prisma_ data layer.
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
  
