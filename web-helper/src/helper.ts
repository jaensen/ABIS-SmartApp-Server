import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";

import IdTokenVerifier from 'idtoken-verifier';

export class Helper
{
    public static async sessionFromJwt(jwt: string) : Promise<Session_1_0_0>
    {
        const issuer = "ABIS";
        const verifier = new IdTokenVerifier({
            issuer
        });
        let decodedPayload;/* = await new Promise((r1,r2) => {
            verifier.verify(jwt, "4", (error:any, payload:any) => {
                if (!error)
                    r1(payload);
                else
                    r2(error);
            });
        });*/
        decodedPayload = verifier.decode(jwt).payload;

        console.log("web-helper", "Decoded jwt:", decodedPayload);
        //const decodedPayload = jwtDecoder(jwt);

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
}
