# CC Statusline Combined — Premium Dashboard v1.3.0

Claude Code 하단 스테이터스라인에 **API 사용량 + 세션 정보**를 한눈에 보여주는 **4줄 프리미엄 대시보드** 스크립트입니다.
Windows (PowerShell/CMD) 및 WSL 모두 지원합니다.

![statusline-preview](https://github.com/user-attachments/assets/statusline-preview.png)

```
🎧  Daily Usage  | Ctx ██████░░░░ 60% (600k/1M) | 5h  ████░░░░░░ 40% (2h 30m)
📅  7days Usage  | All ██░░░░░░░░ 20% (3d 12h)   | Sn  ████░░░░░░ 40% (2h 30m)
🔧  Codex-5.4xh no data | feat: add statusline

🚀  Opus 4.6·md | 3 CLAUDE.md | 6 MCP | 2 Hooks | $1.25 | ⏱ 15m 30s | +120 -45 | ⚡ 78% Cache | 📝 3 Todos
```

## v1.3.0 새 기능

- 4줄 프리미엄 대시보드 레이아웃 (컬러 프로그레스 바)
- 프롬프트 캐시 효율(⚡ Cache Hit Rate %) 표시
- 열린 Todo 개수(📝) 표시
- CLAUDE.md / MCP 서버 / Hooks 카운트
- Windows Terminal TrueColor 자동 감지

## 표시 항목

| 줄 | 항목 | 설명 |
|----|------|------|
| 1 | Daily Usage | 컨텍스트 윈도우 사용률 + 5시간 Rate Limit |
| 2 | 7days Usage | 7일 전체 사용률 + 세션 사용률 |
| 3 | Codex + Git | Codex 정보 + 마지막 Git 커밋 메시지 |
| 4 | Session Info | 모델, CLAUDE.md 수, MCP, Hooks, 비용, 시간, 라인 변경, 캐시율, Todos |

### 세부 항목

| 항목 | 예시 | 설명 |
|------|------|------|
| 모델 | `Opus 4.6·md` | 현재 사용 중인 모델 |
| 컨텍스트 | `Ctx ██████░░░░ 60%` | 프로그레스 바 + 컨텍스트 윈도우 사용량 (초록→노랑→빨강) |
| 5시간 사용률 | `5h ████░░░░░░ 40%` | 5시간 기준 API 사용률 + 리셋까지 남은 시간 |
| 7일 사용률 | `All ██░░░░░░░░ 20%` | 7일 기준 API 사용률 + 리셋까지 남은 시간 |
| 세션 비용 | `$1.25` | 현재 세션에서 사용한 비용 (USD) |
| 경과 시간 | `⏱ 15m 30s` | 세션 시작 후 경과 시간 |
| 코드 변경 | `+120 -45` | 추가/삭제된 코드 라인 수 |
| 캐시 효율 | `⚡ 78% Cache` | 프롬프트 캐시 히트율 |
| Todos | `📝 3 Todos` | 열린 Todo 항목 수 |
| Git 커밋 | `feat: add statusline` | 마지막 Git 커밋 메시지 |

## 설치

### 전제 조건

- **Claude Code** 설치 완료
- **Node.js 18+** 설치 완료

### Mac / Linux (원라인 설치)

```bash
npx -y cc-alchemy-statusline && curl -fsSL https://raw.githubusercontent.com/kyuhyi/cc-statusline-combined/main/install.sh | bash
```

<details>
<summary>수동 설치 (단계별)</summary>

```bash
# 1. cc-alchemy-statusline 설치 (5h/7d 사용량 API)
npx -y cc-alchemy-statusline

# 2. 통합 스크립트 다운로드
curl -fsSL https://raw.githubusercontent.com/kyuhyi/cc-statusline-combined/main/statusline-combined.mjs -o ~/.claude/statusline-combined.mjs

# 3. 설정 적용
node ~/.claude/statusline-combined.mjs

# 4. Claude Code 재시작
```

</details>

### Windows (PowerShell 원라인 설치)

```powershell
npx -y cc-alchemy-statusline; irm https://raw.githubusercontent.com/kyuhyi/cc-statusline-combined/main/install.ps1 | iex
```

<details>
<summary>수동 설치 (단계별)</summary>

```powershell
# 1. cc-alchemy-statusline 설치
npx -y cc-alchemy-statusline

# 2. 통합 스크립트 다운로드
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/kyuhyi/cc-statusline-combined/main/statusline-combined.mjs" -OutFile "$env:USERPROFILE\.claude\statusline-combined.mjs"

# 3. 설정 적용
node "$env:USERPROFILE\.claude\statusline-combined.mjs"

# 4. Claude Code 재시작
```

</details>

## 설치 확인

Claude Code를 재시작하면 터미널 하단에 스테이터스라인이 표시됩니다.

처음에는 5h/7d 사용량이 `--`로 표시될 수 있습니다. API 데이터를 가져오는 데 몇 초 정도 걸리며, 다음 응답부터 정상 표시됩니다.

## 제거

### 방법 1: Claude Code 내에서

```
/statusline delete
```

### 방법 2: 수동 제거

`~/.claude/settings.json` 파일에서 `"statusLine"` 항목을 삭제합니다.

```json
{
  "statusLine": {   ← 이 블록 전체 삭제
    "type": "command",
    "command": "node ~/.claude/statusline-combined.mjs"
  }
}
```

### 방법 3: cc-alchemy-statusline만 사용하기 (원본으로 복원)

```bash
npx -y cc-alchemy-statusline
```

이 명령어를 다시 실행하면 cc-alchemy 기본 스테이터스라인으로 돌아갑니다.

## 색상 의미

스테이터스라인의 사용률 색상은 현재 상태를 직관적으로 보여줍니다:

| 색상 | 의미 |
|------|------|
| 🟢 초록 | 여유 (50% 미만) |
| 🟡 노랑 | 주의 (50~90%) |
| 🔴 빨강 | 위험 (90% 이상) |

## FAQ

### Q: 5h/7d 사용량이 계속 `--`로 표시돼요

OAuth 로그인이 필요합니다. `claude` 명령어로 Claude Code에 로그인되어 있는지 확인하세요. API Key 방식으로는 사용량 조회가 지원되지 않습니다.

### Q: 비용($)이 $0.00으로 표시돼요

세션을 새로 시작하면 $0.00부터 시작합니다. 대화가 진행되면 누적 비용이 표시됩니다.

### Q: 터미널이 좁아서 잘려요

터미널 폭이 좁으면 자동으로 2줄로 나뉩니다:
```
Opus 4.6 | main* | ▓▓░░░░░░░░ 23% 46k/200k
5h 7% (2h36m) | 7d 33% (1d4h) | $1.45 | ⏱12m | +42 -8
▸ 마지막 프롬프트
```

### Q: cc-alchemy-statusline 업데이트는 어떻게 하나요?

cc-alchemy-statusline은 24시간마다 자동 업데이트를 확인합니다. 수동 업데이트:

```bash
npx -y cc-alchemy-statusline
```

## 구조

```
~/.claude/
├── cc-alchemy-statusline.mjs    # API 사용량 (5h/7d) + 마지막 프롬프트
├── statusline-combined.mjs      # 통합 스크립트 (alchemy + 비용/시간/라인)
├── statusline_cache.json        # API 응답 캐시 (5분 TTL)
└── settings.json                # Claude Code 설정 (statusLine 항목)
```

## 사용법 (Premium v1.3.0)

1. 이 저장소의 `statusline-combined.mjs`를 다운로드하여 Claude 설정 폴더에 넣습니다.
   - **Windows**: `C:\Users\<사용자>\.claude\`
   - **WSL/Linux**: `~/.claude/`
2. Claude Code의 `settings.json`을 열어 `statusLine` 항목을 다음과 같이 수정합니다:
   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "node ~/.claude/statusline-combined.mjs"
     }
   }
   ```
   - WSL 기준 경로입니다. Windows의 경우 `node %USERPROFILE%\.claude\statusline-combined.mjs`를 사용하세요.
3. Claude Code를 재시작하면 4줄의 미려한 대시보드가 나타납니다.

## Credits

- [cc-alchemy-statusline](https://www.npmjs.com/package/cc-alchemy-statusline) - 5h/7d API 사용량 조회 엔진
