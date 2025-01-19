import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import fs from 'fs';
import { parse } from 'yaml';
import { validateInferenceDefinitions, validateRelationPatterns } from '../../../src/utils/validate';
import logger from '../../../src/utils/logger';

import { loadRelationDefinitions } from '../../../src/services/import';

vi.mock('fs');
vi.mock('yaml');
vi.mock('../../../src/utils/validate');
vi.mock('../../../src/utils/logger');

describe('loadRelationDefinitions', () => {
  const mockFilePath = './mockRelations.yml';
  const mockParsedData = {
    inference: { enabled: true, strategy: 'default' },
    relations: [
      { parentQualifiedColumn: 'users.id', childQualifiedColumns: ['orders.user_id'] },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and return valid relation definitions', () => {
    (fs.readFileSync as Mock).mockReturnValue('mock file content');
    (parse as Mock).mockReturnValue(mockParsedData);
    (validateInferenceDefinitions as Mock).mockReturnValue(true);
    (validateRelationPatterns as Mock).mockReturnValue(true);

    const result = loadRelationDefinitions(mockFilePath);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    expect(parse).toHaveBeenCalledWith('mock file content');
    expect(validateInferenceDefinitions).toHaveBeenCalledWith(mockParsedData.inference);
    expect(validateRelationPatterns).toHaveBeenCalledWith(mockParsedData.relations);
    expect(logger.debug).toHaveBeenCalledWith(
      `Starting to read the relation definition file at path: ${mockFilePath}`
    );
    expect(logger.debug).toHaveBeenCalledWith(
      `Relation definitions are valid. Relation definitions: ${JSON.stringify(mockParsedData)}`
    );
    expect(result).toEqual(mockParsedData);
  });

  it('should throw an error if inference validation fails', () => {
    (fs.readFileSync as Mock).mockReturnValue('mock file content');
    (parse as Mock).mockReturnValue(mockParsedData);
    (validateInferenceDefinitions as Mock).mockReturnValue(false);

    expect(() => loadRelationDefinitions(mockFilePath)).toThrow(
      `Invalid relation pattern format in ${mockFilePath}.`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    expect(parse).toHaveBeenCalledWith('mock file content');
    expect(validateInferenceDefinitions).toHaveBeenCalledWith(mockParsedData.inference);
    expect(validateRelationPatterns).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(
      `Starting to read the relation definition file at path: ${mockFilePath}`
    );
  });

  it('should throw an error if relation patterns validation fails', () => {
    (fs.readFileSync as Mock).mockReturnValue('mock file content');
    (parse as Mock).mockReturnValue(mockParsedData);
    (validateInferenceDefinitions as Mock).mockReturnValue(true);
    (validateRelationPatterns as Mock).mockReturnValue(false);

    expect(() => loadRelationDefinitions(mockFilePath)).toThrow(
      `Invalid relation pattern format in ${mockFilePath}.`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    expect(parse).toHaveBeenCalledWith('mock file content');
    expect(validateInferenceDefinitions).toHaveBeenCalledWith(mockParsedData.inference);
    expect(validateRelationPatterns).toHaveBeenCalledWith(mockParsedData.relations);
    expect(logger.debug).toHaveBeenCalledWith(
      `Starting to read the relation definition file at path: ${mockFilePath}`
    );
  });

  it('should throw an error if parsed data is invalid or undefined', () => {
    (fs.readFileSync as Mock).mockReturnValue('mock file content');
    (parse as Mock).mockReturnValue(undefined);

    expect(() => loadRelationDefinitions(mockFilePath)).toThrow(
      `Invalid relation pattern format in ${mockFilePath}.`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    expect(parse).toHaveBeenCalledWith('mock file content');
    expect(validateInferenceDefinitions).not.toHaveBeenCalled();
    expect(validateRelationPatterns).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(
      `Starting to read the relation definition file at path: ${mockFilePath}`
    );
  });
});
