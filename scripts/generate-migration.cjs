const { spawn } = require('child_process');
const path = require('path');

// Use 'pnpm.cmd' on Windows
const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const args = ['payload', 'migrate:create', 'initial_schema'];

console.log(`Running: ${cmd} ${args.join(' ')}`);

const child = spawn(cmd, args, {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, CI: 'true' }, // Try CI=true to potentially skip prompts or fail fast
    shell: true, // Important for Windows
    stdio: ['pipe', 'inherit', 'inherit']
});

// Solution for interactive prompts:
// Send 'Enter' repeatedly to accept defaults for "create table" vs "rename"
const timer = setInterval(() => {
    if (child.stdin.writable) {
        child.stdin.write('\n'); // Send Enter
        // Also try sending 'y\n' just in case, though 'Enter' is for list selection
        // child.stdin.write('y\n'); 
    }
}, 1000);

child.on('close', (code) => {
    clearInterval(timer);
    console.log(`Migration process exited with code ${code}`);
    process.exit(code);
});

child.on('error', (err) => {
    console.error('Failed to start subprocess.', err);
    process.exit(1);
});
