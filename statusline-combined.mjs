#!/usr/bin/env node
/**
 * Combined Claude Code Statusline
 * = cc-alchemy-statusline (5h/7d API usage, last prompt)
 * + session cost, duration, lines changed
 *
 * Install (Mac):   npx -y cc-alchemy-statusline && curl -fsSL https://raw.githubusercontent.com/petercho42/cc-statusline-combined/main/install.sh | bash
 * Install (Win):   npx -y cc-alchemy-statusline && irm https://raw.githubusercontent.com/petercho42/cc-statusline-combined/main/install.ps1 | iex
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir, platform } from "os";
import { execFileSync } from "child_process";

const HOME = homedir();
const IS_WIN = platform() === "win32";
const ALCHEMY_SCRIPT = join(HOME, ".claude", "cc-alchemy-statusline.mjs");
const SELF_PATH = join(HOME, ".claude", "statusline-combined.mjs");
const SETTINGS_PATH = join(HOME, ".claude", "settings.json");

// --- Colors (Catppuccin Mocha palette, matching cc-alchemy) ---
const USE_COLOR = (() => {
  if (!IS_WIN) return true;
  return !!(process.env.WT_SESSION || process.env.TERM_PROGRAM || process.env.COLORTERM);
})();

const rgb = (r, g, b) => USE_COLOR ? `\x1b[38;2;${r};${g};${b}m` : "";
const RST = USE_COLOR ? "\x1b[0m" : "";
const DIM = rgb(108, 112, 134);
const TEXT = rgb(205, 214, 244);
const GREEN = rgb(166, 227, 161);
const RED = rgb(243, 139, 168);

// --- Helpers ---
function loadJson(path) {
  try { return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {}; } catch { return {}; }
}

function formatDuration(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr > 0) return `${hr}h${min % 60}m`;
  if (min > 0) return `${min}m${sec % 60}s`;
  return `${sec}s`;
}

function formatCost(usd) {
  return `$${Number(usd).toFixed(2)}`;
}

// --- Install mode (TTY) ---
function install() {
  const claudeDir = join(HOME, ".claude");
  if (!existsSync(claudeDir)) mkdirSync(claudeDir, { recursive: true });

  // Check if cc-alchemy-statusline exists
  if (!existsSync(ALCHEMY_SCRIPT)) {
    console.log("⚠ cc-alchemy-statusline.mjs not found. Installing...");
    try {
      execFileSync("npx", ["-y", "cc-alchemy-statusline"], {
        stdio: "inherit",
        timeout: 30000,
        ...(IS_WIN ? { shell: true, windowsHide: true } : {}),
      });
    } catch {
      console.error("✗ Failed to install cc-alchemy-statusline. Run 'npx -y cc-alchemy-statusline' manually first.");
      process.exit(1);
    }
  }

  // Copy self to ~/.claude/
  const selfContent = readFileSync(new URL(import.meta.url).pathname, "utf8");
  writeFileSync(SELF_PATH, selfContent);

  // Update settings.json
  const settings = loadJson(SETTINGS_PATH);
  const cmd = `node ${SELF_PATH}`;
  if (settings?.statusLine?.command === cmd) {
    console.log(`✓ Already configured.`);
  } else {
    settings.statusLine = { type: "command", command: cmd };
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    console.log("✓ Combined statusline installed!");
    console.log(`  Location: ${SELF_PATH}`);
  }

  console.log("");
  console.log("📊 Shows: model | branch | context | 5h% | 7d% | $cost | ⏱time | +lines -lines");
  console.log("          ▸ last prompt");
  console.log("");
  console.log("Restart Claude Code to apply.");
}

// --- Main statusline output ---
function main() {
  let data;
  try {
    const input = readFileSync(0, "utf-8").trim();
    if (!input) { console.log("No data"); return; }
    data = JSON.parse(input);
  } catch {
    console.log("No data");
    return;
  }

  // Run cc-alchemy-statusline and capture output
  let alchemyLines = [];
  try {
    const result = execFileSync("node", [ALCHEMY_SCRIPT], {
      input: JSON.stringify(data),
      encoding: "utf8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
      ...(IS_WIN ? { windowsHide: true } : {}),
    });
    alchemyLines = result.split("\n").filter(l => l.length > 0);
  } catch {
    // Fallback: just show model + basic info
    const model = data.model?.display_name || data.model?.id || "?";
    alchemyLines = [`${model}`];
  }

  // Extract cost, duration, lines from data
  const cost = data.cost?.total_cost_usd || 0;
  const duration = data.cost?.total_duration_ms || 0;
  const added = data.cost?.total_lines_added || 0;
  const removed = data.cost?.total_lines_removed || 0;

  const SEP = ` ${DIM}|${RST} `;

  // Build extra segment
  const extra = [
    `${TEXT}${formatCost(cost)}${RST}`,
    `${DIM}⏱${TEXT}${formatDuration(duration)}${RST}`,
    `${GREEN}+${added}${RST} ${RED}-${removed}${RST}`,
  ].join(SEP);

  // Append extra to first line of alchemy output
  if (alchemyLines.length > 0) {
    // First line: alchemy info + extra
    console.log(`${alchemyLines[0]}${SEP}${extra}`);
    // Rest: usage split line + last prompt (from alchemy)
    for (let i = 1; i < alchemyLines.length; i++) {
      console.log(alchemyLines[i]);
    }
  } else {
    console.log(extra);
  }
}

// --- Entry ---
if (process.stdin.isTTY) {
  install();
} else {
  main();
}
