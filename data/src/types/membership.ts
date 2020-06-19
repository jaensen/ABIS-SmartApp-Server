import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";

export class Membership
{
    readonly id:number;
    readonly creatorId:number;
    readonly memberId:number;
    readonly groupId:number;

    constructor(id:number, creatorId:number, memberId:number, groupId:number)
    {
        this.id = id;
        this.creatorId = creatorId;
        this.memberId = memberId;
        this.groupId = groupId;
    }
}