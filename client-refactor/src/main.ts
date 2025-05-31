// main.ts
// Use case: Fetch the Hello-World repo and print out the README using the GitHub API

import axios from 'axios';
import * as readline from 'readline';

console.log('--- GitHub Repo README Fetcher ---');
console.log('This script fetches a GitHub user, lists all their repositories, and lets you select one to print its README.');
console.log('Usage: node src/main.js');
console.log('Default user: octocat');
console.log('-------------------------------------\n');

// Inline service chain logic (no functions)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Enter a GitHub username (default: octocat): ', (inputUsername) => {
    const username = inputUsername.trim() || 'octocat';
    console.log('Starting service chain for user:', username);

    // Step 1: Fetch user data
    axios.get(`https://api.github.com/users/${username}`)
        .then(userResponse => {
            const user = userResponse.data;
            console.log('\n[Step 1] User data fetched successfully:', user);

            // Step 2: Fetch all repos for the user
            return axios.get(`https://api.github.com/users/${username}/repos`);
        })
        .then(reposResponse => {
            const repos: any[] = reposResponse.data;
            if (!Array.isArray(repos) || repos.length === 0) {
                console.log('No repositories found for this user. Exiting.');
                rl.close();
                process.exit(0);
            }
            console.log(`\n[Step 2] Found ${repos.length} repositories for user '${username}':`);
            repos.forEach((repo: any, idx: number) => {
                console.log(`  [${idx}] ${repo.name}`);
            });

            // Step 3: Prompt user to select a repo
            rl.question('\nEnter the number of the repository to print its README: ', (answer) => {
                const idx = parseInt(answer, 10);
                if (isNaN(idx) || idx < 0 || idx >= repos.length) {
                    console.error('Invalid selection. Exiting.');
                    rl.close();
                    process.exit(1);
                }
                const selectedRepo = repos[idx].name;
                console.log(`\n[Step 3] You selected: ${selectedRepo}`);
                // Step 4: Fetch and print README
                axios.get(`https://api.github.com/repos/${username}/${selectedRepo}/readme`, {
                    headers: { 'Accept': 'application/vnd.github.v3.raw' }
                })
                    .then(readmeResponse => {
                        console.log('README content:\n', readmeResponse.data);
                        rl.close();
                    })
                    .catch(error => {
                        console.error('Error fetching README:', error.message);
                        rl.close();
                    });
            });
        })
        .catch(error => {
            console.error('Error in service chain:', error.message);
            rl.close();
        });
});
