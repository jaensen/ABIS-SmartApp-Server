import {Agent_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/agent_1_0_0";
import {SchemaTypes} from "@abis/types/dist/schemas/_generated/schemaTypes";

export class Agent implements Agent_1_0_0 {
    readonly id:number;
    readonly name: string;
    readonly implementation: string;

    constructor(id:number, name:string, implementation:string)
    {
        this.id = id;
        this.name = name;
        this.implementation = implementation;
    }

    [k: string]: unknown;
    _$schemaId: SchemaTypes.Agent_1_0_0 = SchemaTypes.Agent_1_0_0;
}