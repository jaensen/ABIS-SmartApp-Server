import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {config} from "./config";

const jsonwebtoken = require('jsonwebtoken');

export class Helper
{
    public static async sessionFromJwt(jwt: string) : Promise<Session_1_0_0>
    {
        jsonwebtoken.verify(jwt, config.authentication.jwtSecret);
        const decodedPayload = jsonwebtoken.decode(jwt);

        return <Session_1_0_0> {
            _$schemaId: SchemaTypes.Session_1_0_0,
            id: decodedPayload.jti,
            validTo: new Date(decodedPayload.exp * 1000).toJSON(),
            createdAt: new Date(decodedPayload.iat * 1000).toJSON(),
            owner: decodedPayload.sub,
            timezoneOffset: decodedPayload.timezoneOffset,
            jwt: jwt,
        };
    }

    public static sessionToJwt(session:Session_1_0_0) : string
    {
        if (!session.validTo)
            throw new Error("The session mus have a validTo date in JSON format.");

        if (!session.createdAt)
            throw new Error("The session mus have a createdAt date in JSON format.");

        const tokenData = {
            jti: session.id,
            iss: config.authentication.jwtIssuer,
            exp: new Date(session.validTo).getTime() / 1000,
            iat: new Date(session.createdAt).getTime() / 1000,
            sub: session.owner,
            timezoneOffset: session.timezoneOffset
        };

        const jwt: string = jsonwebtoken.sign(tokenData, config.authentication.jwtSecret);
        return jwt;
    }
}