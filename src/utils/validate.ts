import { isInferenceDefinitions, isRelationPattern } from '../types.js';
import logger from '../utils/logger.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateInferenceDefinitions(inference: any): boolean {
  const isValid = isInferenceDefinitions(inference);
  if (!isValid) {
    logger.debug('Inference is invalid.');
  }
  return isValid;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateRelationPattern(relation: any, index: number): boolean {
  const isValid = isRelationPattern(relation);
  if (!isValid) {
    logger.debug(`Relation at index ${index+1} is invalid. relation: ${JSON.stringify(relation)}`);
  }
  return isValid;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateRelationPatterns(relations: any): boolean {
  if (!relations || !Array.isArray(relations)) {
    logger.debug('Relations is not specified.')
    return true;
  }
  return relations.every(validateRelationPattern);
}

export {
  validateInferenceDefinitions,
  validateRelationPatterns,
  validateRelationPattern
};
