import { execSync } from 'child_process';

describe('CLI Tests', () => {
  it('should execute the CLI command successfully', () => {
    const output = execSync('npm start -- --help').toString();

    expect(output).toContain('Usage');
  });
});
