#!/bin/bash
# cc-statusline-combined installer (Mac/Linux)
set -e

CLAUDE_DIR="$HOME/.claude"
SCRIPT="$CLAUDE_DIR/statusline-combined.mjs"
ALCHEMY="$CLAUDE_DIR/cc-alchemy-statusline.mjs"
SETTINGS="$CLAUDE_DIR/settings.json"
REPO_URL="https://raw.githubusercontent.com/kyuhyi/cc-statusline-combined/main"

echo ""
echo "🔧 Claude Code Combined Statusline Installer"
echo "=============================================="
echo ""

# 1. Ensure ~/.claude exists
mkdir -p "$CLAUDE_DIR"

# 2. Install cc-alchemy-statusline if not present
if [ ! -f "$ALCHEMY" ]; then
  echo "📦 Installing cc-alchemy-statusline..."
  npx -y cc-alchemy-statusline
  echo ""
fi

# 3. Download combined script
echo "📥 Downloading statusline-combined.mjs..."
curl -fsSL "$REPO_URL/statusline-combined.mjs" -o "$SCRIPT"

# 4. Configure settings.json
CMD="node $SCRIPT"
if [ -f "$SETTINGS" ]; then
  # Update existing settings
  TMP=$(mktemp)
  node -e "
    const fs = require('fs');
    const s = JSON.parse(fs.readFileSync('$SETTINGS', 'utf8'));
    s.statusLine = { type: 'command', command: '$CMD' };
    fs.writeFileSync('$TMP', JSON.stringify(s, null, 2));
  "
  mv "$TMP" "$SETTINGS"
else
  # Create new settings
  echo "{\"statusLine\":{\"type\":\"command\",\"command\":\"$CMD\"}}" | node -e "
    const fs = require('fs');
    let d = ''; process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>fs.writeFileSync('$SETTINGS', JSON.stringify(JSON.parse(d),null,2)));
  "
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Statusline shows:"
echo "   Model | Branch | Context | 5h% | 7d% | \$Cost | ⏱Time | +Lines -Lines"
echo "   ▸ Last prompt"
echo ""
echo "🔄 Restart Claude Code to apply."
echo ""
