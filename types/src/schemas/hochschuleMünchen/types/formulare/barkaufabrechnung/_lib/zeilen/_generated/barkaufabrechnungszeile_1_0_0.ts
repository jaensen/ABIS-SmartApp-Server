import { SchemaTypes } from "../../../../../../../_generated/schemaTypes";

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Barkaufabrechnungszeile_1_0_0 {
   _$schemaId: SchemaTypes.Barkaufabrechnungszeile_1_0_0;

  position?: number;
  rechnungsdatum?: {
    [k: string]: unknown;
  };
  firma?: string;
  betrag?: number;
  kostenart?: string;
  dienstlicherAnlass?: string;
  artDerLeistung?: string;
  ivsNummer?: string;
  nichtErstattungsfähig?: boolean;
  [k: string]: unknown;
}
