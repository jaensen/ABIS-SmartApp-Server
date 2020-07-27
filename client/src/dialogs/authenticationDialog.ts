import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {AskFor_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/interactionPatterns/_generated/askFor_1_0_0";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {Dialog} from "@abis/dialog/dist/dialog";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {DialogBuilder} from "@abis/dialog/dist/dialogBuilder";
import {AgentDialogContext} from "@abis/dialog/dist/agentDialogContext";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {Signup_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/signup_1_0_0";
import {Challenge_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/challenge_1_0_0";
import {Login_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/login_1_0_0";

export class AuthenticationDialog extends Dialog
{
    constructor(duplexChannel: IDuplexChannel, session:Session_1_0_0)
    {
        super(duplexChannel, session);
    }

    protected build()
    {
        const builder = new DialogBuilder<
            ""
            | "signup_sent"
            | "challenge_sent"
            | "login_sent"
            | "authorized",
            AgentDialogContext>();

        // TODO: Handle retries (Retry_1_0_0 events)
        builder
            .when("")
                .onEnter()
                    .await(
                        this.getUserInput(SchemaTypes.Signup_1_0_0)
                    ).onErrorRetry()
                    .sendResult()
                    .goto("signup_sent")

            .when("signup_sent")
                .on<AskFor_1_0_0>(SchemaTypes.AskFor_1_0_0, e => e.next == SchemaTypes.Challenge_1_0_0)
                    .await(
                        this.getUserInput(SchemaTypes.Challenge_1_0_0)
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
                        this.getUserInput(SchemaTypes.Login_1_0_0)
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

    private getUserInput(type: SchemaTypes)
    {
        return function (p1: AgentDialogContext, p2: SchemaType, p3: SchemaType)
        {
            return new Promise<SchemaType>((resolve, reject) => {
                if (type == SchemaTypes.Signup_1_0_0) {
                    resolve(<Signup_1_0_0>{
                        _$schemaId: SchemaTypes.Signup_1_0_0,
                        email: "hans@peter.de",
                        password: "123",
                        passwordConfirmation: "123",
                        firstName: "Hans",
                        lastName: "Peter",
                        timezoneOffset: -120
                    });
                } else if (type == SchemaTypes.Challenge_1_0_0) {
                    resolve(<Challenge_1_0_0>{
                        _$schemaId: SchemaTypes.Challenge_1_0_0,
                        code: "123"
                    });
                } else if (type == SchemaTypes.Login_1_0_0) {
                    resolve(<Login_1_0_0>{
                        _$schemaId: SchemaTypes.Login_1_0_0,
                        email: "hans@peter.de",
                        password: "123"
                    });
                }
                throw new Error("")
            });
        };
    }
}

export const Class = AuthenticationDialog;
