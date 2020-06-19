import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";

export class Entry {
    readonly id:number;
    readonly owner:number;
    readonly name:string;
    readonly groupId: number;
    readonly data: SchemaType;

    constructor(id:number, owner:number, groupId:number, name:string, data:SchemaType)
    {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.groupId = groupId;
        this.data = data;
    }
}