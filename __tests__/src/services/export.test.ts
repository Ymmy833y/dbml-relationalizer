import { describe, it, expect, vi, beforeEach } from 'vitest';

import fs from 'fs';
import { EOL } from 'os';
import { importer } from '@dbml/core';
import { Relation, DatabaseSchemaJson } from '../../../src/types';
import logger from '../../../src/utils/logger';

import { generate } from '../../../src/services/export';

vi.mock('fs');
vi.mock('../../../src/utils/logger');
vi.mock('@dbml/core', () => ({
  importer: {
    generateDbml: vi.fn(),
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
    vi.clearAllMocks();
  });

  it('should generate DBML and reference strings and print to stdout if no output file is specified', () => {
    const mockDbml = 'DBML_CONTENT';
    const expectedRef = 'Ref "infer_fk_ParentTable_ChildTable_ParentColumn":"ParentTable"."ParentColumn" < "ChildTable"."ChildColumn"';

    // Mock importer.generateDbml
    vi.spyOn(importer, 'generateDbml').mockReturnValue(mockDbml);

    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockRejectedValue(undefined);

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
    vi.spyOn(importer, 'generateDbml').mockReturnValue(mockDbml);

    generate(mockSchemaJson, mockRelations, outFile);

    expect(fs.writeFileSync).toHaveBeenCalledWith(outFile, mockDbml + EOL + expectedRef);
    expect(logger.debug).toHaveBeenCalledWith(`Successfully wrote to file: ${outFile}`);
  });

  it('should handle empty relations array', () => {
    const mockDbml = 'DBML_CONTENT';

    vi.spyOn(importer, 'generateDbml').mockReturnValue(mockDbml);

    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockRejectedValue(undefined);

    generate(mockSchemaJson, []);

    expect(importer.generateDbml).toHaveBeenCalledWith(mockSchemaJson);
    expect(logger.debug).toHaveBeenCalledWith('No output file specified, printing to stdout.');
    expect(consoleSpy).toHaveBeenCalledWith(mockDbml + EOL);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
