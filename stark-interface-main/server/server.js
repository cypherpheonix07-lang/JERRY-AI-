const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, Object.assign({ cwd: process.cwd(), shell: false }, opts));
    let out = '';
    proc.stdout.on('data', d => { out += d.toString(); });
    proc.stderr.on('data', d => { out += d.toString(); });
    proc.on('close', code => resolve({ code, output: out }));
  });
}

app.post('/api/ruflo', async (req, res) => {
  const args = req.body.args || ['--help'];
  // Try to run the bundled CLI
  const cliPath = path.join(__dirname, '..', 'ruflo-main', 'ruflo-main', 'bin', 'cli.js');
  try {
    const v3cwd = path.join(__dirname, '..', 'ruflo-main', 'ruflo-main', 'v3');
    const result = await runCommand(process.execPath, [cliPath, ...args], { cwd: v3cwd });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/hermes', async (req, res) => {
  const args = req.body.args || ['--help'];
  const hermesCwd = path.join(__dirname, '..', 'hermes-agent-main', 'hermes-agent-main');
  const scriptPath = path.join(hermesCwd, 'run_agent.py');
  try {
    const result = await runCommand('python', [scriptPath, ...args], { cwd: hermesCwd });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Bridge server listening on ${PORT}`));
