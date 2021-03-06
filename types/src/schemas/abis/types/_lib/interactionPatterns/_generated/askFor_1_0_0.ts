import { SchemaTypes } from "../../../../../_generated/schemaTypes";

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Prompts the client to send a new Entry of the specified type (definition) to proceed with the dialog.
 */
export interface AskFor_1_0_0 {
   _$schemaId: SchemaTypes.AskFor_1_0_0;

  /**
   * The type (definition) of the entry that is requested from the client.
   */
  next: string;
  /**
   * A iso formatted date/time string that specifies how long the agent will wait for a response.
   */
  timeoutAt?: string;
  /**
   * Can contain a result from the previous request.
   */
  result?: {
    _$schemaId: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
