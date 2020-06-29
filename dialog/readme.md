# @abis/dialog
This package contains the _DialogBuilder_, and the components necessary to run _Dialogs_ which have been built with it.  

_Dialogs_ are basically state machines. The state-transitions are triggered by incoming events. Similar to _Agents_,
they run their own event loop and subscribe to an _EventBroker_. 
They operate on top of [IDuplexChannels](../interfaces/src/duplexChannel.ts).

_Dialogs_ work completely independent of [ABIS Server](../server) so that they can be used on the client-side as well.

## DialogBuilder
The _DialogBuilder_ provides a fluent interface to describe cause->reaction relations.
The cause is defined by an [_Event_ type](../types) ("_$schemaId":"abis-schema://.."), the reactions are defined by a list 
of promises.

A _Dialog_ is always in a known state. The list of possible states is specified up-front as a string-based union type.
It must always have an initial state (""): 

```typescript
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder"; 
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";

const builder = new DialogBuilder<
    ""
    | "signup"
    | "signup:challenge"
    | "login"
    | "change_password"
    | "reset_password"
    | "reset_password:challenge"
    | "reset_password:set_password"
    | "finished" , IDialogContext>();
```

With the new DialogBuilder, you can now create an action->reaction map for every state:
```typescript
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {Signup_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/signup_1_0_0";
import {Login_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/login_1_0_0";

builder
    .when("")
        .on<Login_1_0_0>(SchemaTypes.Login_1_0_0)
            .pipeEventTo("login")
        .on<Signup_1_0_0>(SchemaTypes.Signup_1_0_0)
            .pipeEventTo("signup")

    .when("login")
        .on<Login_1_0_0>(SchemaTypes.Login_1_0_0)
            .await(validateLogin).onErrorRetry()
            .await(createSessionFromLogin).onErrorFail()
            .sendResult()
            .goto("finished")

    .when("finished")
        .onEnter()
            .close();
```
The above (non-functioning because incomplete) snippet already demonstrates nearly the complete feature set of the 
_DialogBuilder_. The _DialogBuilder_ offers the possibility to define _States_, and _States_ offer the possibility to 
define _Triggers_. 

**DialogBuilder:**

* **when(state:string)**   
Introduces a reaction map for the specified state. Each state can only appear in one "when()" clause of the builder.
This method returns a _StateBuilder_

**StateBuilder:**

* **on\<TEvent extends SchemaType\>(typeId:SchemaTypes, filter?:(e:TEvent) => boolean)**  
Within a _StateBuilder_, you can handle incoming _Events_ in the "on()"-clause. It can filter the incoming _Events_ so 
that you can branch depending on the values of properties. At the moment, you can only use synchronous code in filters.
This method returns a _TriggerBuilder_.

* **onEnter()**  
Within a _StateBuilder_ you can use the onEnter-_Trigger_ to execute side effects whenever the state is entered. 
It behaves exactly like the other "on"-clause but has obviously no _Event_. 
Instead of the _Event_, a _Void_1_0_0_ object will be passed. This method returns a _TriggerBuilder_.

**TriggerBuilder:**

* **await\<TAwaitResult extends SchemaType\>(promise:(context:TContext, event:TEvent) => Promise\<TAwaitResult\>)**  
Within a _TriggerBuilder_, you can await side effects. Side effects can have a return value. 
If no value should be returned, an instance of _Void_1_0_0_ must be returned instead.
This method returns a _TriggerBuilder_.

* **sendResult()**  
Within a _TriggerBuilder_, you can send the result of the last side effect (await) to the connected out-Channel. 
In the above example, this is used to return a session object that was created by the "createSessionFromLogin" 
side effect to the requesting _Agent_. This method returns a _TriggerBuilder_.

* **send\<TMessage extends SchemaType\>(messageFactory:(context:TContext, event:TEvent, result:TResult => Promise\<TMessage\>)**  
Within a _TriggerBuilder_, you can send arbitrary messages which are created at runtime by the passed-in message factory
to the out-channel. This method returns a _TriggerBuilder_.

* **stay()**  
A stay-statement marks the end of an "on"-clause. The _Dialog_ remains in the same state after the execution of the 
_Trigger_. This method returns a _StateBuilder_.

* **goto(nextState:TStates)**  
Within a _TriggerBuilder_, you can transition to a different state. A goto-statement always marks the end of an 
"on"-clause. This method returns a _StateBuilder_.

* **pipeEventTo(nextState:TStates)**  
Within a _TriggerBuilder_, you can transition to a different state and pipe the current event to it.
When executed at runtime, it behaves as if the nextState would regularly receive the event. 
A pipeEventTo-statement always marks the end of an "on"-clause. This method returns a _StateBuilder_.

* **pipeResultTo(nextState:TStates)**  
Within a _TriggerBuilder_, you can transition to a different state and pipe the current result object to it.
When executed at runtime, it behaves as if the nextState would regularly receive the last result as event. 
A pipeResultTo-statement always marks the end of an "on"-clause. This method returns a _StateBuilder_.

* **close()**  
A close-statement marks the end of an "on"-clause and the _Dialog_ as a whole. 
When executed at runtime, the underlying channel will be closed. This method returns a _StateBuilder_.

**Error handling:**  
Since the _Dialog_ should always be in a known state (one of the custom ones, or the built-in 'error' state),
all side effects are executed in a try..catch block by the runtime. You can, to some extent, control what the runtime 
does in case of an error (this applies only to side effects):

* **onErrorFail()**  
The _Dialog_ propagates the error up to the runtime.

* **onErrorIgnore()**  
The _Dialog_ ignores the error and continues with the next step.

* **onErrorRetry(times:number)**  
The _Dialog_ will send a _Retry_1_0_0_ event to the out-channel. It contains the faulty request as payload. The other
party can then edit and re-send the failed request up to "times"-times".   

## RuntimeDialog
When you ultimately build() the _DialogBuilder_, you get a _RuntimeDialog_ back:
```typescript
import {RuntimeDialog} from "@abis/dialog/dist/runtime/runtimeDialog"; 

const runtimeDialog:RuntimeDialog = builder.build();
```
The _RuntimeDialog_ mirrors the description from the _DialogBuilder_ but instead of _StateBuilder_ instances,
it contains a list of _RuntimeStates_. These, instead of _TriggerBuilder_ instances, contain a list of _RuntimeTrigger_
instances.

A _RuntimeDialog_ and all its sub-components are responsible to hold the state of a Dialog during its whole lifespan. 
While the _RuntimeDialog_ and _RuntimeState_ have only structural properties and hold state, _RuntimeTriggers_ are 
executable.

**RuntimeTrigger**  
During build(), the single operations under each _TriggerBuilder_ (await, goto, ..) will be converted to 
_Operation\<TContext extends IDialogContext\>_ objects. So a _RuntimeTrigger_ contains the executable representatives
of the operations from the _TriggerBuilder_.  

The single operations are executed one by one, and the result of the preceding operation is fed into the next:
```typescript
async execute(context:TContext, event:SchemaType) : Promise<void>
{
    let result:SchemaType = <Void_1_0_0>{ _$schemaId: SchemaTypes.Void_1_0_0 };

    for (let op of this.ops)
    {
        result = await op.execute(context, event, result);
    }
} 
```

## Dialog
The Dialog is an abstract base class for custom dialogs. It has an abstract build() method that is expected to return
a new RuntimeDialog each time the method is called:
```typescript
export class AuthenticationDialog extends Dialog
{
    protected build() : RuntimeState<string, DialogContext>[]
    {
        const builder = new DialogBuilder<
            ""
            | "signup"
            | "signup:challenge"
            | "more states .." , DialogContext>();

        // Use the builder to describe the dialog ...

        return builder.build();
    }
}
```
