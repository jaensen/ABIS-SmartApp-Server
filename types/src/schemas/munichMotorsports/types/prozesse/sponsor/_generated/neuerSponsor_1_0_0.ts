import { SchemaTypes } from "../../../../../_generated/schemaTypes";

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface NeuerSponsor_1_0_0 {
   _$schemaId: SchemaTypes.NeuerSponsor_1_0_0;

  neuerSponsor?: Sponsor;
  [k: string]: unknown;
}
export interface Sponsor {
  id?: number;
  name: string;
  [k: string]: unknown;
}
