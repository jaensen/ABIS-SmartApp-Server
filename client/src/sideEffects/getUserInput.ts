import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {Signup_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/signup_1_0_0";
import {Challenge_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/challenge_1_0_0";
import {Login_1_0_0} from "@abis/types/dist/schemas/abis/types/authentication/_generated/login_1_0_0";

/**
 * Should query the requested data from the user via a UI-dialog or similar.
 * @param outType The expected SchemaType
 */
export function getUserInput<TContext, TOut extends SchemaType>(outType:SchemaTypes) : ((context:TContext, event:SchemaType) => Promise<SchemaType>)
{
    if (outType == SchemaTypes.Signup_1_0_0)
    {
        return async (context:TContext, event:SchemaType) =>
        {
            return <Signup_1_0_0>{
                _$schemaId: outType,
                timezoneOffset: -120,
                lastName: "Mustermann",
                firstName: "Max",
                passwordConfirmation: "123",
                password: "123",
                email: "max@mustermanns.de"
            }
        };
    }
    else if (outType == SchemaTypes.Challenge_1_0_0)
    {
        return async (context:TContext, event:SchemaType) =>
        {
            return <Challenge_1_0_0>{
                _$schemaId: SchemaTypes.Challenge_1_0_0,
                sub: "ich",
                code: "123"
            };
        }
    }
    else if (outType == SchemaTypes.Login_1_0_0)
    {
        return async (context:TContext, event:SchemaType) =>
        {
            return <Login_1_0_0>{
                _$schemaId: SchemaTypes.Login_1_0_0,
                email: "max@mustermanns.de",
                password: "123"
            };
        }
    }

    throw new Error("Not implemented");
}