import { SchemaTypes } from "../../../../../_generated/schemaTypes";

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Contains the basic metadata about an agent
 */
export interface Agent_1_0_0 {
   _$schemaId: SchemaTypes.Agent_1_0_0;

  id: number;
  createdAt?: string;
  name: string;
  type?: "Profile" | "Companion" | "Singleton";
  timezoneOffset?: number;
  implementation: string;
  [k: string]: unknown;
}
