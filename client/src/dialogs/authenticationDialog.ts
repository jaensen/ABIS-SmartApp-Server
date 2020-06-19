import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {AskFor_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/interactionPatterns/_generated/askFor_1_0_0";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {Dialog, DialogContext} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {RuntimeState} from "@abis/dialog/dist/runtime/runtimeState";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {getUserInput} from "../sideEffects/getUserInput";

export class AuthenticationDialog extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, jwt: string)
    {
        super(duplexChannel, jwt);
    }

    protected build() : RuntimeState<string, DialogContext>[]
    {
        const builder = new DialogBuilder<
            ""
            | "signup_sent"
            | "challenge_sent"
            | "login_sent"
            | "authorized",
            DialogContext>();

        // TODO: Handle retries (Retry_1_0_0 events)
        builder
            .when("")
                .onEnter()
                    .await(
                        getUserInput(SchemaTypes.Signup_1_0_0)
                    ).onErrorRetry()
                    .sendResult()
                    .goto("signup_sent")

            .when("signup_sent")
                .on<AskFor_1_0_0>(SchemaTypes.AskFor_1_0_0, e => e.next == SchemaTypes.Challenge_1_0_0)
                    .await(
                        getUserInput(SchemaTypes.Challenge_1_0_0)
                    ).onErrorRetry()
                    .sendResult()
                    .goto("challenge_sent")

            .when("challenge_sent")
                .on<Session_1_0_0>(SchemaTypes.Session_1_0_0)
                    .await(
                        async (context, e) => e /* TODO: Implement 'change identity' or similar.. */
                    ).onErrorFail()
                    .goto("authorized")
                .on<AskFor_1_0_0>(SchemaTypes.AskFor_1_0_0, e => e.next == SchemaTypes.Login_1_0_0)
                    .await(
                        getUserInput(SchemaTypes.Login_1_0_0)
                    ).onErrorRetry()
                    .sendResult()
                    .goto("login_sent")

            .when("login_sent")
                .on<Session_1_0_0>(SchemaTypes.Session_1_0_0)
                    .await(
                        async (context, e) => e /* TODO: Implement 'change identity' or similar.. */
                    ).onErrorFail()
                    .goto("authorized")

            .when("authorized")
                .onEnter()
                    .close();

        return builder.build();
    }
}

export const Class = AuthenticationDialog;