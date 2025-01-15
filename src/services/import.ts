import fs from 'fs';
import { parse } from 'yaml';
import { RelationDefinitions } from '../types.js';
import { validateInferenceDefinitions, validateRelationPatterns } from '../utils/validate.js';
import logger from '../utils/logger.js';

const defaultFilePath = './relations.yml';

function loadRelationDefinitions(filePath: string = defaultFilePath): RelationDefinitions {
  logger.debug(`Starting to read the relation definition file at path: ${filePath}`);

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const parsed = parse(fileContents);
  if (
    parsed &&
    validateInferenceDefinitions(parsed.inference) &&
    validateRelationPatterns(parsed.relations)
  ) {
    logger.debug(`Relation definitions are valid. Relation definitions: ${JSON.stringify(parsed)}`);
    return parsed as RelationDefinitions;
  } else {
    throw Error(`Invalid relation pattern format in ${filePath}.`);
  }
};

export {
  loadRelationDefinitions
};
