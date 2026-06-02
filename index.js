const { spawn } = require("node:child_process");

const candidates = ["python3", "python"];

function start(index = 0) {
  if (index >= candidates.length) {
    console.error("Python runtime not found. Tried: " + candidates.join(", "));
    process.exit(1);
  }

  const command = candidates[index];
  const child = spawn(command, ["main.py"], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("error", () => start(index + 1));
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

start();
