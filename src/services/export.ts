import fs from 'fs';
import { EOL } from 'os';
import { importer } from '@dbml/core';
import { Relation, DatabaseSchemaJson } from '../types.js';
import logger from '../utils/logger.js';

function generateRef(relations: Relation[]): string {
  return relations
    .map(({ parentTable, parentColumn, childTable, childColumn }) => {
      const identifier = `"infer_fk_${parentTable}_${childTable}_${parentColumn}"`;
      const parentRef = `"${parentTable}"."${parentColumn}"`;
      const childRef = `"${childTable}"."${childColumn}"`;

      return `Ref ${identifier}:${parentRef} < ${childRef}`;
    })
    .join(EOL + EOL);
}

function generate(schemaJson: DatabaseSchemaJson, relations: Relation[], outFile?: string) {
  const dbml = importer.generateDbml(schemaJson);
  const ref = generateRef(relations);

  const res = dbml + EOL + ref;

  if (outFile) {
    fs.writeFileSync(outFile, res);
    logger.debug(`Successfully wrote to file: ${outFile}`);
  } else {
    logger.debug('No output file specified, printing to stdout.');
    console.log(res); // Fallback: print to stdout
  }
}

export {
  generate
};
