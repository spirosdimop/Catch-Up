import { exec } from 'child_process';
import fs from 'fs';

// Function to execute shell commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(stderr);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function pushSchema() {
  try {
    console.log('Pushing database schema...');
    
    // Push all tables to the database (this does not require user input)
    const result = await executeCommand('npx drizzle-kit push --verbose');
    console.log(result);
    
    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Failed to push schema:', error);
    process.exit(1);
  }
}

pushSchema();