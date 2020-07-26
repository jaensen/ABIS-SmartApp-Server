import {Dialog} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {RuntimeState} from "@abis/dialog/dist/runtime/runtimeState";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {Signup_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/signup_1_0_0";
import {Login_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/login_1_0_0";
import {ChangePassword_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/changePassword_1_0_0";
import {AskFor_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/interactionPatterns/_generated/askFor_1_0_0";
import {Challenge_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/challenge_1_0_0";
import {ResetPassword_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/resetPassword_1_0_0";
import {SetPassword_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/setPassword_1_0_0";
import {Void_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/_generated/void_1_0_0";

export class AuthenticationDialog extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, session: Session_1_0_0)
    {
        super(duplexChannel, session);
    }

    protected build() : RuntimeState<string>[]
    {
        const builder = new DialogBuilder<
            ""
            | "signup"
            | "signup:challenge"
            | "login"
            | "change_password"
            | "reset_password"
            | "reset_password:challenge"
            | "reset_password:set_password"
            | "finished" , AgentDialogContext>();

        builder
            .when("")
                .on<Signup_1_0_0>(SchemaTypes.Signup_1_0_0)
                    .pipeEventTo("signup")
                .on<Login_1_0_0>(SchemaTypes.Login_1_0_0)
                    .pipeEventTo("login")
                .on<ChangePassword_1_0_0>(SchemaTypes.ChangePassword_1_0_0)
                    .await(validateChangePassword).onErrorRetry()
                    .await(changePassword).onErrorFail()
                    .goto("finished")

            .when("signup")
                .on<Signup_1_0_0>(SchemaTypes.Signup_1_0_0)
                    .await(validateSignup).onErrorRetry()
                    .await(createUser).onErrorFail()
                    .await(createProfile).onErrorFail()
                    .send(async (context, event) =>
                    {
                        return <AskFor_1_0_0>{
                            _$schemaId: SchemaTypes.AskFor_1_0_0,
                            next: SchemaTypes.Challenge_1_0_0
                        };
                    })
                    .goto("signup:challenge")

            .when("signup:challenge")
                .on<Challenge_1_0_0>(SchemaTypes.Challenge_1_0_0)
                    .await(validateChallenge).onErrorRetry()
                    .await(createSessionFromChallenge).onErrorFail()
                    .sendResult()
                    .goto("finished")

            .when("login")
                .on<Login_1_0_0>(SchemaTypes.Login_1_0_0)
                    .await(validateLogin).onErrorRetry()
                    .await(createSessionFromLogin).onErrorFail()
                    .sendResult()
                    .goto("finished")

            .when("reset_password")
                .on<ResetPassword_1_0_0>(SchemaTypes.ResetPassword_1_0_0)
                    .await(resetPassword).onErrorIgnore()
                    .send(async (context, event) => {
                        return <AskFor_1_0_0>{
                            _$schemaId: SchemaTypes.AskFor_1_0_0,
                            next: SchemaTypes.Challenge_1_0_0
                        }
                    })
                    .goto("reset_password:challenge")

            .when("reset_password:challenge")
                .on<Challenge_1_0_0>(SchemaTypes.Challenge_1_0_0)
                    .await(validateChallenge).onErrorRetry()
                    .await(createSessionFromChallenge).onErrorFail()
                    .sendResult()
                    .send(async (context, event) => {
                        return <AskFor_1_0_0>{
                            _$schemaId: SchemaTypes.AskFor_1_0_0,
                            next: SchemaTypes.SetPassword_1_0_0
                        }
                    })
                    .goto("reset_password:set_password")

            .when("reset_password:set_password")
                .on<SetPassword_1_0_0>(SchemaTypes.SetPassword_1_0_0)
                    .await(validateSetPassword).onErrorRetry()
                    .await(setPassword).onErrorFail()
                    .goto("finished")

            .when("finished")
                .onEnter()
                    .close();

        return builder.build();
    }
}

export const Class = AuthenticationDialog;


type TContext = {};

async function validateSignup(context:TContext, event:Signup_1_0_0) : Promise<Signup_1_0_0> {
    return event;
}
async function createUser(context:TContext, event:Signup_1_0_0) : Promise<Signup_1_0_0>
{
    return event;
}
async function createProfile(context:TContext, event:Signup_1_0_0) : Promise<Signup_1_0_0> {
    return event;
}
async function setChallenge(context:TContext, event:Signup_1_0_0) : Promise<Signup_1_0_0> {
    return event;
}
async function validateChallenge(context:TContext, event:Challenge_1_0_0) : Promise<Challenge_1_0_0> {
    return event;
}
async function validateSetPassword(context:TContext, event:SetPassword_1_0_0) : Promise<SetPassword_1_0_0> {
    return event;
}
async function validateLogin(context:TContext, event:Login_1_0_0) : Promise<Login_1_0_0> {
    return event;
}
async function validateChangePassword(context:TContext, event:ChangePassword_1_0_0) : Promise<ChangePassword_1_0_0> {
    return event;
}
async function changePassword(context:TContext, event:ChangePassword_1_0_0) : Promise<Void_1_0_0> {
    return <Void_1_0_0>{
        _$schemaId: SchemaTypes.Void_1_0_0
    };
}
async function resetPassword(context:TContext, event:ResetPassword_1_0_0) : Promise<Void_1_0_0> {
    return <Void_1_0_0>{
        _$schemaId: SchemaTypes.Void_1_0_0
    };
}
async function createSessionFromChallenge(context:TContext, event:Challenge_1_0_0) : Promise<Session_1_0_0> {
    return <Session_1_0_0>{
        _$schemaId: SchemaTypes.Session_1_0_0,
        jwt: "",
        owner: 0
    };
}
async function createSessionFromLogin(context:TContext, event:Login_1_0_0) : Promise<Session_1_0_0> {
    return <Session_1_0_0>{
        _$schemaId: SchemaTypes.Session_1_0_0,
        jwt: "",
        owner: 0
    };
}
async function setPassword(context:TContext, event:SetPassword_1_0_0) : Promise<Void_1_0_0> {
    return <Void_1_0_0>{
        _$schemaId: SchemaTypes.Void_1_0_0
    };
}
