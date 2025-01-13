import fs from 'fs';
import { parse } from 'yaml';
import { RelationPattern, isRelationPattern } from '../types.js';
import logger from '../utils/logger.js';

const defaultFilePath = './relations.yml';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateRelationPattern(relation: any, index: number): boolean {
  const isValid = isRelationPattern(relation);
  if (!isValid) {
    logger.debug(`Relation at index ${index+1} is invalid. relation: ${JSON.stringify(relation)}`);
  }
  return isValid;
}

function loadRelationPattern(filePath: string = defaultFilePath): RelationPattern[] {
  logger.debug(`Starting to read the relation definition file at path: ${filePath}`);

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const parsed = parse(fileContents);
  if (
    parsed &&
    Array.isArray(parsed.relations) &&
    parsed.relations.every(validateRelationPattern)
  ) {
    logger.debug('All relations are valid.');
    return parsed.relations as RelationPattern[];
  } else {
    throw Error(`Invalid relation pattern format in ${filePath}.`);
  }
};

export {
  loadRelationPattern
};
