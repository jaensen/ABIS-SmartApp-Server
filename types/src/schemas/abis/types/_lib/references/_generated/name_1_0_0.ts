import { SchemaTypes } from "../../../../../_generated/schemaTypes";

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Can be either a 'Nick-', 'First'-, 'Middle'- or 'Last'-name.
 */
export interface Name_1_0_0 {
   _$schemaId: SchemaTypes.Name_1_0_0;

  type: "Nick" | "First" | "Middle" | "Last";
  value: string;
  [k: string]: unknown;
}
