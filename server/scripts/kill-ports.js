// kill-ports.js - Script to kill processes on ports 5000 and 5175 on Windows
import { execSync } from 'child_process';

const ports = [5000, 5175];

console.log(`Checking for processes on ports ${ports.join(' and ')}...`);

ports.forEach(port => {
  try {
    console.log(`Checking port ${port}...`);
    // Find the PID using netstat
    const netstatOutput = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
    
    if (netstatOutput) {
      // Extract PID from the output (last column)
      const lines = netstatOutput.trim().split('\n');
      lines.forEach(line => {
        const pid = line.trim().split(/\s+/).pop();
        if (pid) {
          console.log(`Found process ${pid} on port ${port}. Killing...`);
          try {
            execSync(`taskkill /F /PID ${pid}`);
            console.log(`Process ${pid} on port ${port} killed.`);
          } catch (killError) {
            console.log(`Error killing process ${pid}: ${killError.message}`);
          }
        }
      });
    } else {
      console.log(`No process found on port ${port}.`);
    }
  } catch (error) {
    // This likely means no process was found on that port
    console.log(`No process found on port ${port}.`);
  }
});

console.log('Finished checking and killing processes.');