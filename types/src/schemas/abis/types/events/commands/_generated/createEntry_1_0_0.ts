import { SchemaTypes } from "../../../../../_generated/schemaTypes";

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface CreateEntry_1_0_0 {
   _$schemaId: SchemaTypes.CreateEntry_1_0_0;

  $jwt: string;
  inGroupId: number;
  name: string;
  data: SchemaId;
  [k: string]: unknown;
}
/**
 * Contains the '_$schemaId' attribute which is used to mark an object with a specific SchemaType.
 */
export interface SchemaId {
  _$schemaId: string;
  [k: string]: unknown;
}
