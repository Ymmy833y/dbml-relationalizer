import fs from 'fs';
import { EOL } from 'os';
import { importer } from '@dbml/core';
import { Relation, DatabaseSchemaJson } from '../../../src/types';
import logger from '../../../src/utils/logger';

import { generate } from '../../../src/services/export';

jest.mock('fs');
jest.mock('../../../src/utils/logger');
jest.mock('@dbml/core', () => ({
  importer: {
    generateDbml: jest.fn(),
  },
}));

describe('generate', () => {
  const mockSchemaJson: DatabaseSchemaJson = {
    tables: {},
    fields: {},
    tableConstraints: {}
  };
  const mockRelations: Relation[] = [
    {
      parentTable: 'ParentTable',
      parentColumn: 'ParentColumn',
      childTable: 'ChildTable',
      childColumn: 'ChildColumn',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate DBML and reference strings and print to stdout if no output file is specified', () => {
    const mockDbml = 'DBML_CONTENT';
    const expectedRef = 'Ref "infer_fk_ParentTable_ChildTable_ParentColumn":"ParentTable"."ParentColumn" < "ChildTable"."ChildColumn"';

    // Mock importer.generateDbml
    jest.spyOn(importer, 'generateDbml').mockReturnValue(mockDbml);

    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    generate(mockSchemaJson, mockRelations);

    expect(importer.generateDbml).toHaveBeenCalledWith(mockSchemaJson);
    expect(consoleSpy).toHaveBeenCalledWith(mockDbml + EOL + expectedRef);

    consoleSpy.mockRestore();
  });

  it('should generate DBML and reference strings and write to a file if output file is specified', () => {
    const mockDbml = 'DBML_CONTENT';
    const expectedRef = 'Ref "infer_fk_ParentTable_ChildTable_ParentColumn":"ParentTable"."ParentColumn" < "ChildTable"."ChildColumn"';
    const outFile = 'output.dbml';

    // Mock importer.generateDbml
    jest.spyOn(importer, 'generateDbml').mockReturnValue(mockDbml);

    generate(mockSchemaJson, mockRelations, outFile);

    expect(fs.writeFileSync).toHaveBeenCalledWith(outFile, mockDbml + EOL + expectedRef);
    expect(logger.debug).toHaveBeenCalledWith(`Successfully wrote to file: ${outFile}`);
  });

  it('should handle empty relations array', () => {
    const mockDbml = 'DBML_CONTENT';

    jest.spyOn(importer, 'generateDbml').mockReturnValue(mockDbml);

    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    generate(mockSchemaJson, []);

    expect(importer.generateDbml).toHaveBeenCalledWith(mockSchemaJson);
    expect(logger.debug).toHaveBeenCalledWith('No output file specified, printing to stdout.');
    expect(consoleSpy).toHaveBeenCalledWith(mockDbml + EOL);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
