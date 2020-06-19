# @abis/server
This package contains the API server and host application for ABIS.   

When running, it provides a GraphQL query- and mutation endpoint at [http://localhost:4000](http://localhost:4000) as well as a subscription endpoint on [ws://localhost:4000/graphql](ws://localhost:4000/graphql) or any other configured address.  

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
On the server side, the creation of an anonymous session does the following things:
1) Create an _Agent_ object in the DB  
_The new _Agent_ is owned by the "anon@abis.local" system user._
2) Create a new Session  object in the DB  
_A new _Session_ is created and its 'validTo'-date set. The 'agentId' points to the anonymous Profile and the 'userId' points to the 'anon' system user.  
The created session is then converted into a JWT, signed and returned with the 'jwt'-field in the result._
3) Load a new instance of the _Agent_ implementation as _RuntimeAgent_ into the _AgentHost_  
_The implementation-file (specified by the 'implementation'-field of the Agent) will be loaded by the AgentHost. It then creates a new instance of the Agent, subscribes it to the event system and 'run()'s it._

**2) Send messages**
      
All communication with the server must be done via message passing. Clients can use the 'send()' mutation to send messages to the server:
```graphql
mutation send($event:Json!) {
    send(event: $event) {
        success
        errorMessage
    }
}
```
There are generally two different types of messages:
* Commands:  
_Commands change data or trigger other side-effects. They must include a '$jwt' field that carries the agent's access token.
Examples include: CreateChannel, CloseChannel, CreateEntry .._
* Notifications:  
_Notifications signal the effects of commands to other agents. Examples include: NewGroup, GroupClosed, NewEntry, .._  
  
The send() mutation is intended for the use with _Commands_, but is generally not limited to it.  

Whenever a new message arrives at the server, the following things happen:
1) The event is forwarded the the server-wide (_AbisServer_) event publisher (_IEventPublisher_).
2) The _SystemHook_ inspects the message to make sure that all involved _Agents_ are loaded in the _AgentHost_.
3) The _EventBroker_ distributes the message to all involved _Agents_. 

**3) Receive messages**  

To receive messages from the server, the 'event' subscription can be used:
```graphql
subscription newEvent
{
    event
}
```
The client receives all events that its corresponding _RuntimeAgent_ on the server-side receives. These are mostly 'Notifications' but it is not limited to this kind of message. 