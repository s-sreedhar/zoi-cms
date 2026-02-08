const { spawn } = require('child_process');
const path = require('path');

const cmd = 'pnpm';
const args = ['payload', 'migrate:create', 'fix_prod_schema'];

const child = spawn(cmd, args, {
    cwd: path.resolve(__dirname, '..'), // payload dir
    shell: true,
    stdio: ['pipe', 'inherit', 'inherit']
});

// Send 'Enter' every 2 seconds to accept defaults
const interval = setInterval(() => {
    try {
        child.stdin.write('\n');
    } catch (e) {
        clearInterval(interval);
    }
}, 2000);

child.on('exit', (code) => {
    clearInterval(interval);
    console.log(`Migration exited with code ${code}`);
    process.exit(code);
});
