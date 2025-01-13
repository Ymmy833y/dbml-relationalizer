import fs from 'fs';
import { parse } from 'yaml';
import { RelationPattern } from '../../../src/types';
import logger from '../../../src/utils/logger';

import { loadRelationPattern } from '../../../src/services/import';

jest.mock('fs');
jest.mock('yaml');
jest.mock('../../../src/utils/logger');

describe('loadRelationPattern', () => {
  const validRelationPattern: RelationPattern = {
    parentQualifiedColumn: 'parent_table.parent_column',
    childQualifiedColumns: ['child_table.child_column1', 'child_table.child_column2'],
    ignoreChildQualifiedColumns: ['ignore_child_table.ignore_child_column1'],
  };

  const invalidRelationPattern = {
    parentQualifiedColumn: 'parent_table.parent_column',
    // Missing `childQualifiedColumns`
  };

  const defaultFilePath = './relations.yml';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a valid array of RelationPattern when file contains valid data', () => {
    const fileContents = 'mock yaml content';
    const parsedYaml = {
      relations: [validRelationPattern],
    };

    jest.spyOn(fs, 'readFileSync').mockReturnValue(fileContents);
    (parse as jest.Mock).mockReturnValue(parsedYaml);

    const result = loadRelationPattern();

    expect(fs.readFileSync).toHaveBeenCalledWith(defaultFilePath, 'utf8');
    expect(parse).toHaveBeenCalledWith(fileContents);
    expect(result).toEqual(parsedYaml.relations);
    expect(logger.debug).toHaveBeenCalledWith(
      'Starting to read the relation definition file at path: ./relations.yml'
    );
    expect(logger.debug).toHaveBeenCalledWith('All relations are valid.');
  });

  it('should throw an error when file contains invalid relation pattern', () => {
    const fileContents = 'mock yaml content';
    const parsedYaml = {
      relations: [validRelationPattern, invalidRelationPattern],
    };

    jest.spyOn(fs, 'readFileSync').mockReturnValue(fileContents);
    (parse as jest.Mock).mockReturnValue(parsedYaml);

    expect(() => loadRelationPattern()).toThrowError(
      `Invalid relation pattern format in ${defaultFilePath}.`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(defaultFilePath, 'utf8');
    expect(logger.debug).toHaveBeenCalledWith(
      'Starting to read the relation definition file at path: ./relations.yml'
    );
    expect(logger.debug).toHaveBeenCalledWith(
      `Relation at index 2 is invalid. relation: ${JSON.stringify(invalidRelationPattern)}`
    );
  });

  it('should use the provided filePath if specified', () => {
    const filePath = './custom-relations.yml';
    const fileContents = 'mock yaml content';
    const parsedYaml = {
      relations: [validRelationPattern],
    };

    jest.spyOn(fs, 'readFileSync').mockReturnValue(fileContents);
    (parse as jest.Mock).mockReturnValue(parsedYaml);

    const result = loadRelationPattern(filePath);

    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
    expect(parse).toHaveBeenCalledWith(fileContents);
    expect(result).toEqual(parsedYaml.relations);
    expect(logger.debug).toHaveBeenCalledWith(
      `Starting to read the relation definition file at path: ${filePath}`
    );
  });

  it('should throw an error if file content is invalid YAML', () => {
    const fileContents = 'mock yaml content';
    const parsedYaml = null;

    jest.spyOn(fs, 'readFileSync').mockReturnValue(fileContents);
    (parse as jest.Mock).mockReturnValue(parsedYaml);

    expect(() => loadRelationPattern()).toThrowError(
      `Invalid relation pattern format in ${defaultFilePath}.`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(defaultFilePath, 'utf8');
    expect(logger.debug).toHaveBeenCalledWith(
      'Starting to read the relation definition file at path: ./relations.yml'
    );
  });
});
