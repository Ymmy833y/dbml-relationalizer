import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('CLI Tests', () => {
  it('should execute the CLI command successfully', () => {
    const output = execSync('npm run dev -- --help').toString();

    expect(output).toContain('Usage');
  }, 10000);
});
