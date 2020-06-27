# ABIS Server
This repository contains the server component of abis. The server provides a GraphQL-API and comes with a client library.  
It is based on [Apollo Server](https://www.apollographql.com/docs/apollo-server/) and [Prisma 2](https://www.prisma.io/).

## Quickstart
**1) Clone the repository:**  
```
$ git clone https://github.com/ABISCloud/ABIS-OS1-Server.git
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
ABIS Server is a bare-bones collaboration server that is targeted at 
independent software vendors who want to integrate it into their applications or 
use it as their sole backend. 
  
It provides authentication and authorization, a group-chat, notifications, 
forms, charts and a workflow system under one application-agnostic GraphQL API.

Besides the built-in functionality, it is expandable with own _Dialogs_. 
Dialogs are blueprints for chatbot-conversations. 
Most ABIS features have been implemented in the form of Dialogs.     

## Fundamentals
ABIS Server builds on a few core concepts that should be explained shortly: 

### Agents  
Every user of the system (human or not) is represented by one or multiple Agents. 
Agents are the only "active" component in the system (they run custom  code). 
There are three different types of them:  
* **Singleton**  
Singleton agents are created by the system and exist exactly once. 
They can be identified by their name. 
The list of singleton agents on a server can be queried by it's clients.  
One example for a singleton agent is the "authentication" agent.  
* **Profile**  
Profiles represent a person or organization. 
When a client connects via the API, it will always act as a Profile agent.  
Profiles can be anonymous. Anonymous profiles are temporary.
* **Companion**  
Companion agents can be used when another object should be provided with "agency". 
The other object can be either a Group or an Entry. 
An example would be a task-entry which has a deadline. 
If e.g. a notification should be triggered when that deadline falls, 
the entry must have a Companion-Agent that tracks the current time and triggers when the deadline falls.  
  
### Groups  
Agents can participate together in Groups and use them to exchange messages. 
Groups can be 'persisted' or 'volatile'. 
Entries in volatile groups won't be stored in the DB but will only be delivered as notification.   
 
There are four different types of Groups. They differ mostly in their number of members and visibility:
* **Stash**  
A Stash has no _Members_. Only the owner-_Agent_ has access to it. Stashes are always 'private'.   
They are used by an Agent to store private data of any kind.  
* **Channel**  
A Channel has exactly one _Member_. 
Only the owner can write to it, the member can read. 
Channels are always 'private'.  
They are used either for a person to person chat or as carrier for application protocols.
* **Room**  
A Room has many _Members_. All members can read and write. Rooms can be 'public' or 'private'.  
They are used whenever multiple Agents need to colloborate with each other.
* **Share**  
A Share has no _Members_ but everyone can read it (always public). Only the owner can write to it.  
They are used as a way to announce things or to provide shared resources to many agents.

### Events
Every action in ABIS is triggered by an _Event_. _Events_ must have a "_$schemaId" property that identifies the content
type of the event. _Agents_ exchange _Events_ in _Dialogs_ to provide different service to each other.

### Entries
Entries are basically persistable _Events_. An _Event_ becomes an entry when it was posted in a _Group_.
Everything that must be persisted, is stored as an Entry. Entries are JSON objects that are 
stored together with a server-wide unique id and a global unique schema-id. 
Every object must contain a "_$schemaId"-field that identifies the JSON-Schema that represents the object.  

An Entry must be in exactly one Group and has a 'owner' Agent which can edit and delete the Entry.  
Entries are visible to everyone who is a member of the Group, the Entry lives in. 
The Group-owner can also delete Entries.

### Dialogs
Dialogs are state machine descriptions that are executed by Agents. 
State transitions can be triggered by any Event that reaches the Agent.
In every transition, the Agent can then execute side-effects and send own events in response or close the Dialog with a result.  

Dialogs are usually run on top of Channels, so that exactly two Agents "talk to each other".
However, they can be also used on top of Rooms. In that case, more than one Agent can control the Dialog.

## Repository structure
The repository contains multiple npm-packages. Each package has its own readme file:
* __@abis/dialog__:  
Contains mechanisms to describe a Dialog between two Agents as a State-Machine and a runtime 
to execute these descriptions.  
  * _Readme: [dialog/readme.md](dialog)_
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
* __@abis/server__:  
Contains the Apollo Server based NodeJS application.  
  * _Readme: [server/readme.md](server)_
  * _Uses: @abis/types, @abis/interfaces, @abis/events, @abis/data, @abis/log_
* __@abis/client__:  
Contains the client library for the use in own applications.  
  * _Readme:
  * _Uses: @abis/types, @abis/interfaces, @abis/dialog, @abis/events, @abis/log_
* __@abis/types__:  
Contains a collection of JsonSchema documents and corresponding TypeScript interfaces that 
describe e.g. all events that are used throughout the system.
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
* __@abis/data__:  
Contains classes that provide access to the _Prisma_ data layer.
  * _Uses: @abis/types, @abis/interfaces, @abis/log_
  
Copyright © 2020 ABIS Cloud (DBI Analytics GmbH)
Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE License, which is included in this repository or available at https://www.gnu.org/licenses/agpl-3.0.en.html
