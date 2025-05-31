// __tests__/main.test.ts
import { spawn } from 'child_process';
import path from 'path';

describe('GitHub Repo README Fetcher', () => {
  it('should fetch octocat, list repos, and print the first repo README', (done) => {
    // Path to the compiled script
    const scriptPath = path.resolve(__dirname, '../build/src/main.js');
    // Start the script as a child process
    const child = spawn('node', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    let sentUsername = false;
    let sentRepoIdx = false;

    // Handle stdout from the script
    child.stdout.on('data', (data) => {
      output += data.toString();
      // Respond to username prompt
      if (!sentUsername && output.includes('Enter a GitHub username')) {
        child.stdin.write('\n'); // Use default: octocat
        sentUsername = true;
      }
      // Respond to repo selection prompt
      if (sentUsername && !sentRepoIdx && output.includes('Enter the number of the repository')) {
        child.stdin.write('0\n'); // Select first repo
        sentRepoIdx = true;
      }
    });

    // Handle stderr from the script
    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    // When the script finishes, check the output
    child.on('close', () => {
      // Key output checks for the service chain
      expect(output).toContain('Starting service chain for user: octocat');
      expect(output).toMatch(/\[Step 1\] User data fetched successfully:/);
      expect(output).toMatch(/\[Step 2\] Found \d+ repositories for user 'octocat':/);
      expect(output).toMatch(/\[Step 3\] You selected:/);
      expect(output).toMatch(/README content:/);
      done();
    });
  }, 20000);
});
