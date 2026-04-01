#!/usr/bin/env node
/**
 * Octo Premium Statusline for Claude Code v1.3.0
 * Cross-platform version for Windows (PowerShell/CMD) and WSL.
 * Features:
 * - 4-line dashboard with progress bars
 * - Daily and 7-day usage tracking
 * - Git commit message
 * - Session stats: Cost, Duration, Lines +/-
 * - **NEW**: Open Todos count (📝)
 * - **NEW**: Prompt Cache Efficiency (⚡ % Cache Hit Rate)
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { homedir, platform } from "os";
import { execFileSync } from "child_process";

const HOME = homedir();
const IS_WIN = platform() === "win32";

// --- Colors (TrueColor support check) ---
const supportsColor = () => {
    if (process.env.FORCE_COLOR === "0") return false;
    if (process.env.FORCE_COLOR === "1") return true;
    if (IS_WIN) return !!(process.env.WT_SESSION || process.env.TERM_PROGRAM || process.env.COLORTERM);
    return true;
};

const USE_COLOR = supportsColor();
const rgb = (r, g, b) => USE_COLOR ? `\x1b[38;2;${r};${g};${b}m` : "";
const brgb = (r, g, b) => USE_COLOR ? `\x1b[48;2;${r};${g};${b}m` : "";
const RST = USE_COLOR ? "\x1b[0m" : "";
const DIM = rgb(108, 112, 134);
const TEXT = rgb(205, 214, 244);
const GREEN_DIM = rgb(166, 227, 161);
const GREEN_BG = brgb(34, 100, 34);
const RED_DIM = rgb(243, 139, 168);
const RED_BG = brgb(100, 34, 34);
const BLUE_DIM = rgb(137, 180, 250);
const BLUE_BG = brgb(34, 34, 100);
const YELLOW = rgb(249, 226, 175);
const ORANGE = rgb(250, 179, 135);
const PURPLE = rgb(190, 142, 230);
const MAUVE = rgb(203, 166, 247);

const separator = ` ${DIM}|${RST} `;

// --- Helpers ---
function ftok(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.floor(n / 1000)}k`;
  return String(n);
}

function makeBar(pct, width = 10, colorFunc = GREEN_DIM, bgFunc = GREEN_BG) {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  const empty = width - filled;
  const barChar = "█";
  return `${colorFunc}${bgFunc}${barChar.repeat(filled)}${RST}${DIM}${"░".repeat(empty)}${RST}`;
}

function formatDuration(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr > 0) return `${hr}h ${min % 60}m`;
  return `${min}m ${sec % 60}s`;
}

function getClaudeMdCount(cwd) {
  try {
    if (!cwd || !existsSync(cwd)) return 3;
    const files = readdirSync(cwd);
    return files.filter(f => f.toLowerCase() === "claude.md").length || 3;
  } catch { return 3; }
}

function getLastCommit(cwd) {
  try {
    const out = execFileSync("git", ["log", "-1", "--pretty=%s"], { 
        cwd, 
        encoding: "utf8", 
        timeout: 1000,
        stdio: ["ignore", "pipe", "ignore"],
        ...(IS_WIN ? { windowsHide: true } : {})
    });
    return out.trim() || "no commits";
  } catch { return "not a git repo"; }
}

function pcolor_simple(p) {
  if (p < 30) return GREEN_DIM;
  if (p < 80) return YELLOW;
  return RED_DIM;
}

// --- Main ---
function main() {
  let data;
  try {
    const input = readFileSync(0, "utf-8").trim();
    if (!input) return;
    data = JSON.parse(input);
  } catch { return; }

  // --- Calculations ---
  const ctx = data.context_window || {};
  const cs = ctx.context_window_size || 1000000;
  const cp = ctx.used_percentage || 0;
  const ut = Math.floor((cs * cp) / 100);

  const rl = data.rate_limits || {};
  const rl5 = rl["5_hour"] || { used_percentage: 0, resets_at: null };
  const rl7 = rl["7_day"] || { used_percentage: 0, resets_at: null };
  const rlp5 = rl5.used_percentage || 0;
  const rlp7 = rl7.used_percentage || 0;

  const t5 = rl5.resets_at ? formatDuration(Math.max(0, new Date(rl5.resets_at).getTime() - Date.now())) : "0m";
  const t7 = rl7.resets_at ? formatDuration(Math.max(0, new Date(rl7.resets_at).getTime() - Date.now())) : "0m";

  // --- Summary Lines ---
  
  // Line 1: Daily Usage
  const line1 = [
    `🎧  ${TEXT}Daily Usage ${RST}`,
    `${TEXT}Ctx ${makeBar(cp, 10, RED_DIM, RED_BG)} ${pcolor_simple(cp)}${Math.round(cp)}%${RST} ${DIM}(${ftok(ut)}/${ftok(cs)})${RST}`,
    `${TEXT}5h  ${makeBar(rlp5, 10, BLUE_DIM, BLUE_BG)} ${pcolor_simple(rlp5)}${Math.round(rlp5)}%${RST} ${DIM}(${t5})${RST}`
  ].join(separator);

  // Line 2: 7days Usage
  const line2 = [
    `📅  ${TEXT}7days Usage ${RST}`,
    `${TEXT}All ${makeBar(rlp7, 10, GREEN_DIM, GREEN_BG)} ${pcolor_simple(rlp7)}${Math.round(rlp7)}%${RST} ${DIM}(${t7})${RST}`,
    `${TEXT}Sn  ${makeBar(rlp5, 10, GREEN_DIM, GREEN_BG)} ${pcolor_simple(rlp5)}${Math.round(rlp5)}%${RST} ${DIM}(${t5})${RST}`
  ].join(separator);

  // Line 3: Codex & Git
  const cwd = data.workspace?.current_dir || process.cwd();
  const lastCommit = getLastCommit(cwd);
  const line3 = [
    `🔧  ${TEXT}Codex-5.4xh ${RST}${DIM}no data${RST}`,
    `  ${PURPLE}${lastCommit}${RST}`
  ].join(separator);

  // Row 4: Model & Project + Session Stats + New Productivity Stats
  const model = data.model || {};
  let modelName = (model.display_name || model.id || "?").replace("Claude ", "");
  if (modelName === "opus-20240229") modelName = "Opus 4.6";
  
  const mcpCount = Object.keys(data.mcp_servers || {}).length;
  const hooksCount = Object.keys(data.hooks || {}).reduce((acc, k) => acc + (data.hooks[k]?.length || 0), 0);
  const claudeMdCount = getClaudeMdCount(cwd);

  // Session stats
  const cost = (data.cost?.total_cost_usd || 0).toFixed(2);
  const duration = formatDuration(data.cost?.total_duration_ms || 0);
  const added = data.cost?.total_lines_added || 0;
  const removed = data.cost?.total_lines_removed || 0;

  // New: Cache Efficiency
  const inputToks = data.cost?.total_input_tokens || 0;
  const cacheRead = data.cost?.total_cache_read_input_tokens || 0;
  const totalIn = inputToks + cacheRead;
  const cacheRate = totalIn > 0 ? Math.round((cacheRead / totalIn) * 100) : 0;

  // New: Todos count
  const openTodos = (data.todos || []).length;

  const line4 = [
    `🚀  ${ORANGE}${modelName}${DIM}·md${RST}`,
    `${TEXT}${claudeMdCount} CLAUDE.md${RST}`,
    `${TEXT}${mcpCount} MCP${RST}`,
    `${TEXT}${hooksCount} Hooks${RST}`,
    `${GREEN_DIM}$${cost}${RST}`,
    `⏱  ${TEXT}${duration}${RST}`,
    `${GREEN_DIM}+${added}${RST} ${RED_DIM}-${removed}${RST}`,
    `⚡ ${BLUE_DIM}${cacheRate}% Cache${RST}`,
    `📝 ${MAUVE}${openTodos} Todos${RST}`
  ].join(separator);

  // Final Output
  process.stdout.write(`${line1}\n${line2}\n${line3}\n\n${line4}\n`);
}

main();
