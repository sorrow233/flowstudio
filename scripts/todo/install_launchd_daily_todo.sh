#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
用法:
  install_launchd_daily_todo.sh --refresh-token <token> [选项]

选项:
  --script-path <path>   Python 脚本路径（默认: 当前目录下 fetch_daily_todos.py）
  --label <name>         launchd 任务名（默认: work.flowstudio.todo.daily）
  --hour <0-23>          每天执行小时（默认: 9）
  --minute <0-59>        每天执行分钟（默认: 0）
  --mode <mode>          all|unclassified|ai_done|ai_high|ai_mid|self（默认: all）
  --doc-id <id>          docId（默认: flowstudio_v1）
  --output-dir <path>    输出目录（默认: ~/flowstudio/todo-daily）
  --api-url <url>        API 地址（默认: https://flowstudio.catzz.work/api/todo）
  --help                 显示帮助
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
script_path="$SCRIPT_DIR/fetch_daily_todos.py"
label="work.flowstudio.todo.daily"
hour="9"
minute="0"
mode="all"
doc_id="flowstudio_v1"
output_dir="$HOME/flowstudio/todo-daily"
api_url="https://flowstudio.catzz.work/api/todo"
refresh_token=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --refresh-token)
      refresh_token="${2:-}"; shift 2 ;;
    --script-path)
      script_path="${2:-}"; shift 2 ;;
    --label)
      label="${2:-}"; shift 2 ;;
    --hour)
      hour="${2:-}"; shift 2 ;;
    --minute)
      minute="${2:-}"; shift 2 ;;
    --mode)
      mode="${2:-}"; shift 2 ;;
    --doc-id)
      doc_id="${2:-}"; shift 2 ;;
    --output-dir)
      output_dir="${2:-}"; shift 2 ;;
    --api-url)
      api_url="${2:-}"; shift 2 ;;
    --help|-h)
      usage; exit 0 ;;
    *)
      echo "未知参数: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [[ -z "$refresh_token" ]]; then
  echo "缺少 --refresh-token" >&2
  usage
  exit 1
fi

if [[ ! "$hour" =~ ^([01]?[0-9]|2[0-3])$ ]]; then
  echo "--hour 需要是 0-23" >&2
  exit 1
fi

if [[ ! "$minute" =~ ^([0-5]?[0-9])$ ]]; then
  echo "--minute 需要是 0-59" >&2
  exit 1
fi

if [[ ! "$mode" =~ ^(all|unclassified|ai_done|ai_high|ai_mid|self)$ ]]; then
  echo "--mode 非法: $mode" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "未找到 python3" >&2
  exit 1
fi

script_path="$(cd "$(dirname "$script_path")" && pwd)/$(basename "$script_path")"
if [[ ! -f "$script_path" ]]; then
  echo "脚本不存在: $script_path" >&2
  exit 1
fi

mkdir -p "$output_dir"
mkdir -p "$output_dir/logs"
config_dir="$HOME/.config/flowstudio"
mkdir -p "$config_dir"
token_file="$config_dir/todo_refresh_token.txt"
printf '%s' "$refresh_token" > "$token_file"
chmod 600 "$token_file"

plist_dir="$HOME/Library/LaunchAgents"
mkdir -p "$plist_dir"
plist_path="$plist_dir/$label.plist"
stdout_log="$output_dir/logs/${label}.out.log"
stderr_log="$output_dir/logs/${label}.err.log"

cat > "$plist_path" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>$label</string>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/env</string>
      <string>python3</string>
      <string>$script_path</string>
      <string>--refresh-token-file</string>
      <string>$token_file</string>
      <string>--api-url</string>
      <string>$api_url</string>
      <string>--doc-id</string>
      <string>$doc_id</string>
      <string>--mode</string>
      <string>$mode</string>
      <string>--output-text</string>
      <string>$output_dir/latest.txt</string>
      <string>--output-json</string>
      <string>$output_dir/latest.json</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
      <key>Hour</key>
      <integer>$hour</integer>
      <key>Minute</key>
      <integer>$minute</integer>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$stdout_log</string>
    <key>StandardErrorPath</key>
    <string>$stderr_log</string>
  </dict>
</plist>
EOF

uid="$(id -u)"
launchctl bootout "gui/$uid" "$plist_path" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$uid" "$plist_path"
launchctl enable "gui/$uid/$label"
launchctl kickstart -k "gui/$uid/$label" >/dev/null 2>&1 || true

echo "安装完成:"
echo "- label: $label"
echo "- plist: $plist_path"
echo "- token 文件: $token_file (权限 600)"
echo "- 输出文本: $output_dir/latest.txt"
echo "- 输出 JSON: $output_dir/latest.json"
echo "- 日志 stdout: $stdout_log"
echo "- 日志 stderr: $stderr_log"
