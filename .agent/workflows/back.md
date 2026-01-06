---
description: 回退错误更改
---

1. Identify the bad commit or file change.
2. Use `git checkout <commit_hash> -- <path/to/file>` to revert specific files or `git reset --hard HEAD~1` to revert the last commit if it was entirely bad.
3. Clean up any untracked files if necessary.
4. Verify the revert by running the app.
