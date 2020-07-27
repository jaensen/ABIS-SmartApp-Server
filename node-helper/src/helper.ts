import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import fs from "fs";
import path from "path";
import $RefParser from "@apidevtools/json-schema-ref-parser";

const jsonwebtoken = require('jsonwebtoken');

export type FsNode = {
    name: string
    path: string
    contents?: FsNode[]
}

export class Helper
{
    public static readDirectory(dir: string, fileList: FsNode[] = [])
    {
        fs.readdirSync(dir).forEach(file =>
        {
            const filePath = path.join(dir, file)

            if (fs.statSync(filePath).isDirectory())
            {
                fileList.push({
                    name: file,
                    path: filePath,
                    contents: Helper.readDirectory(filePath)
                });
            }
            else
            {
                fileList.push({
                    name: file,
                    path: filePath
                });
            }
        });
        return fileList
    }

    public static $RefParserOptions(definitions: { jsonSchema: object, schemaId: string }[])
    {
        const definitionLookup: { [id: string]: string } = {};
        definitions.forEach(d =>
        {
            definitionLookup[d.schemaId] = JSON.stringify(d.jsonSchema);
        });

        const refOptions: $RefParser.Options = {
            resolve: {
                file: {
                    canRead: file => decodeURI(file.url).startsWith("abis-schema://"),
                    read: async (file: $RefParser.FileInfo) =>
                    {
                        const decodedUrl = decodeURI(file.url);
                        let schemaEntry = definitionLookup[decodedUrl];
                        if (!schemaEntry)
                        {
                            const uri = decodedUrl.replace("#", "");
                            schemaEntry = definitionLookup[uri];
                        }
                        if (!schemaEntry)
                        {
                            throw new Error(`Couldn't resolve schema $id '${decodeURI(decodedUrl)}'`)
                        }

                        return schemaEntry;
                    }
                }
            }
        };

        return refOptions;
    }

    public static recursiveFlatMap<T>(contents: T[], f: (o:T) => T[], flat:T[] = []) : T[]
    {
        contents.forEach(o =>
        {
            const children = f(o);
            children.forEach(c => flat.push(c));
            this.recursiveFlatMap(children, f, flat);
        });

        return flat;
    }

    public static async sessionFromJwt(jwt: string) : Promise<Session_1_0_0>
    {
        jsonwebtoken.verify(jwt, "4"); // TODO: Get jwt secret from config
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
            iss: "ABIS", // TODO: Get jwt issuer from config
            exp: new Date(session.validTo).getTime() / 1000,
            iat: new Date(session.createdAt).getTime() / 1000,
            sub: session.owner,
            timezoneOffset: session.timezoneOffset
        };

        const jwt: string = jsonwebtoken.sign(tokenData, "4"); // TODO: Get jwt secret from config
        return jwt;
    }
}
