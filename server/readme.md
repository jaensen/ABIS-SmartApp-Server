# @abis/server
This package contains the API server and host application for ABIS. 
It brings together all other packages of this repository, 
routes Events and hosts the running Agents and Dialogs.

When running, it provides a GraphQL query- and mutation endpoint at 
[http://localhost:4000](http://localhost:4000) as well as a subscription endpoint at 
[ws://localhost:4000/graphql](ws://localhost:4000/graphql) or any other configured address.  

## Requirements
The server is implemented on top of [Apollo Server](https://www.apollographql.com/docs/apollo-server/) and [Prisma 2](https://www.prisma.io/) so it requires NodeJS and a compatible database server (postgres or mysql).  
It should be possible to run it on Windows, altough all testing and tooling is currently done for Linux only.  
All code-dependencies are managed via npm. 

## API
The complete public API is specified by [src/api/api-schema.graphql](src/api/api-schema.graphql).  
In general, it provides the following mutations, queries and subscriptions:
* **Mutations**:
  * createAnonymousSession() : CreateSessionResponse
  * send(event:Json!) : SendResponse
* **Queries**:
  * myServer: Server!
  * myProfile: Agent!
  * readEntries(groupId:Int! sort:SortOrder after:String first:Int): EntriesPage
* **Subscriptions**:
  * event: Json!

Authentication is handled via sever-issued JWT tokens, which must be present in the "Authorization" header of every API request.  

### Usage  
This section shows the basic GraphQL operations that are necessary to interact with the server:  
   
**1) Create a Session**  
  
To use the API, you must first create a _Session_:
```graphql
mutation {
    createAnonymousSession {
        success
        errorMessage
        jwt                 # Contains the JWT which must be included in the 'Authorization' header of
                            # every subsequent process.
    }
}
```
This will give you a JWT token that must be included in the 'Authorization' http-header of every subsequent request.
The client library creates the session automatically on connect().  

On the server side, the creation of an anonymous session does the following things:
1) Create a new _Profile-Agent_ object in the DB  
The new _Agent_ is owned by the "anon@abis.local" system _User_.
2) Create a new _Session_  object in the DB  
A new _Session_ is created and its 'validTo'-date set. 
The 'agentId' points to the new anonymous _Profile-Agent_ and the 'userId' points to the 'anon' system _User_.  
The created session is then converted into a JWT, signed and returned with the 'jwt'-field in the result.
3) Load a new instance of the _Agent_ implementation as _RuntimeAgent_ into the _AgentHost_  
The implementation-file (specified by the 'implementation'-field of the Agent) will be loaded by the _AgentHost_. 
It then creates a new instance of the _Agent_, subscribes it to the _EventBroker_ and 'run()'s it.
  
**2) Send messages**
      
All communication with the server must be done via message passing. 
Every _Event_ objects must all contain a valid '_$schemaId'-field that specifies the object type.  

There are generally two different types of events:
* **Commands**:  
Commands change data or trigger other side-effects. They must include a '$jwt' field that carries the agent's access token.
Examples include: _CreateChannel_, _CloseChannel_, _CreateEntry_ ..
* **Notifications**:  
Notifications signal the effects of commands to other agents. 
Examples include: _NewGroup_, _GroupClosed_, _NewEntry_, ..   

Clients can use the 'send()' mutation to send _Events_ to the server:
```graphql
mutation send($event:Json!) {
    send(event: $event) {
        success
        errorMessage
    }
}
```  
  
The send() mutation is intended for the use with _Commands_, but is generally not limited to it.  

Whenever a new message arrives at the server, the following things happen:
1) The _Event_ is received by the _MutationResolver_ and is then forwarded to the the server-wide (_AbisServer_)
event publisher (_IEventPublisher_).
2) The _IEventPublisher_ forwards the _Event_ to the _SystemHook_.
3) The _SystemHook_ asks the _EventRouter_ for all _Agents_ that should be notified about this _Event_.
4) The _SystemHook_ calls the 'ensureAgentsAreLoaded()' method on the _AgentHost_ with the agent list from the _EventRouter_ as argument.
5) When the call returns, the _SystemHook_ forwards the _Event_ to the _EventBroker_.
6) The _EventBroker_ asks the _EventRouter_ for all _Agents_ that should be notified about this _Event_.
7) The _EventBroker_ distributes the message to all _Agents_ that the _EventRouter_ returned. 

**3) Receive messages**  

To receive messages from the server, the 'event' subscription can be used:
```graphql
subscription newEvent
{
    event
}
```
You must provide your session-jwt in the 'authorization'-fields of the connection context. The client library does this for you on connect().

When suubscribed, the client receives all events that its corresponding _RuntimeAgent_ on the server-side receives. These are mostly 'Notifications' but it is not limited to this kind of message.  

Whenever a _Client_ subscribes, the following things happen on the server:
1) The _SubscriptionResolver_ receives the subscription, checks the JWT and finds the corresponding _Profile-Agent_.
2) It then passes the _Event_ to the server-wide _IEventPublisher_.