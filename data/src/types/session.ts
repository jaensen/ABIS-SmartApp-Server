import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";

export class Session implements Session_1_0_0
{
    [k: string]: unknown;
    _$schemaId: SchemaTypes.Session_1_0_0 = SchemaTypes.Session_1_0_0;

    readonly id:number;
    readonly jwt:string;
    readonly owner:number;
    readonly createdAt: string;

    private readonly _eventPublisher:IEventPublisher;

    constructor(eventPublisher:IEventPublisher, id:number, owner:number, jwt:string, createdAt?: string)
    {
        this._eventPublisher = eventPublisher;
        this.owner = owner;
        this.jwt = jwt;
        this.id = id;
        this.createdAt = createdAt ?? new Date().toJSON();
    }

}