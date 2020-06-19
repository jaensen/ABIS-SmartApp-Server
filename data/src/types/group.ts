import {SessionRepo} from "../sessionRepo";
import {prisma} from "../prisma";
import {NewMembership_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newMembership_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";
import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {GroupType} from "../groupRepo";
import {Entry} from "./entry";
import {Entry as PrismaEntry} from "@prisma/client";
import {Membership} from "./membership";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";
import {Group_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/group_1_0_0";

const crypto = require("crypto");

export class Group implements Group_1_0_0
{
    [k: string]: unknown;
    _$schemaId: SchemaTypes.Group_1_0_0 = SchemaTypes.Group_1_0_0;

    readonly id:number;
    readonly owner:number;
    readonly createdAt:string;
    readonly name:string;
    readonly type:GroupType;
    readonly volatile:boolean;
    readonly members: Membership[];

    private readonly _eventPublisher:IEventPublisher;
    private readonly _sessionRepo:SessionRepo;

    constructor(eventBroker:IEventPublisher, sessionRepo:SessionRepo, id:number, createdAt:string, type:GroupType, owner:number, name:string, volatile:boolean, members: Membership[])
    {
        this.id = id;
        this.type = type;
        this.owner = owner;
        this.name = name;
        this.createdAt = createdAt;
        this.volatile = volatile;
        this.members = members;
        this._eventPublisher = eventBroker;
        this._sessionRepo = sessionRepo;
    }


    async addMember(jwt:string, memberId:number, showHistory:boolean = false) : Promise<Membership|undefined>
    {
        const session = await this._sessionRepo.findSessionByJwt(jwt);
        if (!session) {
            throw new Error("Cannot find an agent for jwt " + jwt);
        }

        const newMembership = await prisma.membership.create({
            data:{
                type: "Single",
                createdByRequestId: "-",
                createdAt: new Date(),
                createdBy: {
                    connect:{
                        id: session.owner
                    }
                },
                group: {
                    connect: {
                        id: this.id
                    }
                },
                member: {
                    connect:{
                        id: memberId
                    }
                },
                showHistory: showHistory
            }
        });

        await this._eventPublisher.publish(<NewMembership_1_0_0>{
            _$schemaId: SchemaTypes.NewMembership_1_0_0,
            creatorId: newMembership.createdByAgentId,
            groupId: newMembership.groupId,
            id: newMembership.id,
            memberId: newMembership.memberAgentId
        });

        return new Membership(
            newMembership.id,
            newMembership.createdByAgentId,
            newMembership.memberAgentId,
            newMembership.groupId);
    }


    private static generateTempId()
    {
        const randomIntegers = new Int32Array(1);
        crypto.randomFillSync(randomIntegers, 0, 1);
        return randomIntegers[0];
    }

    async addEntry(jwt:string, name:string, data:SchemaType) : Promise<Entry>
    {
        const session = await this._sessionRepo.findSessionByJwt(jwt);
        if (!session)
            throw new Error("Couldn't find a valid session for jwt '" + jwt + "'");

        if (this.type == GroupType.Channel && session.owner != this.owner) {
            throw new Error("Agent " + session.owner + " tries to create an entry in channel " + this.id + " but the channel belongs to someone else.")
        }

        let newEntry:PrismaEntry;
        if (!this.volatile)
        {
            newEntry = await prisma.entry.create({
                data: {
                    name: name,
                    createdBy: {
                        connect: {
                            id: session.owner
                        }
                    },
                    owner: {
                        connect: {
                            id: session.owner
                        }
                    },
                    type: "Data",
                    createdAt: new Date(),
                    group: {
                        connect: {
                            id: this.id
                        }
                    },
                    createdByRequestId: "-",
                    definition: data._$schemaId,
                    data: <any>data
                }
            });
        } else {
            newEntry = <PrismaEntry>{
                type: "Data",
                name: name,
                createdByAgentId: session.owner,
                ownerAgentId: session.owner,
                createdAt: new Date(),
                groupId: this.id,
                definition: data._$schemaId,
                data: <any>data,
                id: Group.generateTempId(),
                createdByRequestId: "-",
            };
        }

        await this._eventPublisher.publish(<NewEntry_1_0_0>{
            _$schemaId: SchemaTypes.NewEntry_1_0_0,
            data: newEntry.data,
            groupId: newEntry.groupId,
            id: newEntry.id,
            name: newEntry.name,
            owner: newEntry.ownerAgentId
        });

        return new Entry(
            newEntry.id,
            newEntry.ownerAgentId,
            newEntry.groupId,
            newEntry.name,
            <SchemaType>newEntry.data);
    }
}