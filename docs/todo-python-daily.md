# 本地 Python 每日读取待办清单

## 目标

每天自动从 Flow Studio 拉取你的未完成待办，并输出为：

- 文本清单：`~/flowstudio/todo-daily/latest.txt`
- 结构化 JSON：`~/flowstudio/todo-daily/latest.json`

## 1. 先手动测试一次

```bash
python3 scripts/todo/fetch_daily_todos.py \
  --refresh-token "<你的 Firebase Refresh Token>" \
  --mode all
```

成功后会在终端打印编号清单，并写入 `latest.txt` 和 `latest.json`。

## 2. 安装每日自动任务（macOS launchd）

```bash
bash scripts/todo/install_launchd_daily_todo.sh \
  --refresh-token "<你的 Firebase Refresh Token>" \
  --hour 9 \
  --minute 0 \
  --mode all
```

说明：

- 默认每天 `09:00` 执行一次。
- token 会保存到 `~/.config/flowstudio/todo_refresh_token.txt`（权限 `600`）。
- 任务安装后会立即执行一次（`RunAtLoad=true`）。

## 3. 常用排查命令

查看任务状态：

```bash
launchctl print gui/$(id -u)/work.flowstudio.todo.daily
```

看最近错误日志：

```bash
tail -n 80 ~/flowstudio/todo-daily/logs/work.flowstudio.todo.daily.err.log
```

看最近输出：

```bash
cat ~/flowstudio/todo-daily/latest.txt
```
