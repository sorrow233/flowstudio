#!/usr/bin/env python3
"""
Flow Studio todo exporter (local Python).

Supports long-lived auth by sending Firebase Refresh Token via:
  X-Firebase-Refresh-Token: <token>
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile

DEFAULT_API_URL = "https://flowstudio.catzz.work/api/todo"
DEFAULT_DOC_ID = "flowstudio_v1"
DEFAULT_MODE = "all"
ALLOWED_MODES = ("all", "unclassified", "ai_done", "ai_high", "ai_mid", "self")
DEFAULT_OUTPUT_TEXT = "~/flowstudio/todo-daily/latest.txt"
DEFAULT_OUTPUT_JSON = "~/flowstudio/todo-daily/latest.json"


class TodoFetchError(RuntimeError):
    """Raised when remote todo fetching fails."""


def _read_refresh_token(args: argparse.Namespace) -> str:
    if args.refresh_token:
        token = args.refresh_token.strip()
        if token:
            return token

    if args.refresh_token_file:
        token_file = Path(args.refresh_token_file).expanduser()
        if not token_file.is_file():
            raise TodoFetchError(f"refresh token 文件不存在: {token_file}")
        token = token_file.read_text(encoding="utf-8").strip()
        if token:
            return token
        raise TodoFetchError(f"refresh token 文件为空: {token_file}")

    raise TodoFetchError("缺少 refresh token，请提供 --refresh-token 或 --refresh-token-file")


def _build_page_url(api_url: str, doc_id: str, mode: str, cursor: int, page_size: int) -> str:
    params = urllib.parse.urlencode(
        {
            "docId": doc_id,
            "mode": mode,
            "cursor": cursor,
            "limit": page_size,
        }
    )
    return f"{api_url}?{params}"


def _parse_json_payload(raw_body: str) -> dict:
    if not raw_body:
        return {}
    try:
        parsed = json.loads(raw_body)
    except json.JSONDecodeError as error:
        raise TodoFetchError(f"接口返回不是有效 JSON: {error}") from error
    if not isinstance(parsed, dict):
        raise TodoFetchError("接口 JSON 顶层不是对象")
    return parsed


def _try_parse_json_payload(raw_body: str) -> dict:
    if not raw_body:
        return {}
    try:
        parsed = json.loads(raw_body)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _request_json_with_retry(
    url: str,
    headers: dict[str, str],
    timeout_sec: float,
    retries: int,
    base_delay_sec: float,
) -> dict:
    last_error: Exception | None = None

    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers, method="GET")
            with urllib.request.urlopen(req, timeout=timeout_sec) as response:
                status = response.getcode()
                body = response.read().decode("utf-8", errors="replace")

            if status >= 500 or status == 429:
                raise TodoFetchError(f"HTTP {status}: {body[:300]}")

            return _parse_json_payload(body)

        except urllib.error.HTTPError as error:
            status = error.code
            body = error.read().decode("utf-8", errors="replace")
            parsed = _try_parse_json_payload(body)
            message = parsed.get("error") if isinstance(parsed, dict) else None
            fallback = body[:220].replace("\n", " ").strip()
            last_error = TodoFetchError(message or fallback or f"HTTP {status}")

            should_retry = status >= 500 or status == 429
            if not should_retry or attempt >= retries:
                raise last_error

        except (urllib.error.URLError, TimeoutError, TodoFetchError) as error:
            last_error = error
            if attempt >= retries:
                raise TodoFetchError(str(last_error)) from error

        delay = base_delay_sec * (2**attempt)
        time.sleep(delay)

    raise TodoFetchError(str(last_error) if last_error else "请求失败")


def _normalize_line(item: dict) -> str:
    value = item.get("normalizedContent") or item.get("content") or "（空）"
    return str(value).strip() or "（空）"


def _fetch_all_todos(
    api_url: str,
    doc_id: str,
    mode: str,
    page_size: int,
    refresh_token: str,
    timeout_sec: float,
    retries: int,
    base_delay_sec: float,
) -> tuple[list[dict], dict]:
    all_items: list[dict] = []
    cursor = 0
    last_payload: dict = {}

    while True:
        url = _build_page_url(api_url, doc_id, mode, cursor, page_size)
        payload = _request_json_with_retry(
            url=url,
            headers={"X-Firebase-Refresh-Token": refresh_token},
            timeout_sec=timeout_sec,
            retries=retries,
            base_delay_sec=base_delay_sec,
        )

        if not payload.get("success"):
            message = payload.get("error") or "接口返回 success=false"
            raise TodoFetchError(str(message))

        items = payload.get("items")
        if not isinstance(items, list):
            raise TodoFetchError("接口返回缺少 items 列表")

        all_items.extend(items)
        last_payload = payload

        has_more = bool(payload.get("hasMore"))
        next_cursor = payload.get("nextCursor")
        if not has_more:
            break

        if not isinstance(next_cursor, int):
            raise TodoFetchError("接口返回 hasMore=true 但 nextCursor 非整数")
        if next_cursor <= cursor:
            raise TodoFetchError("接口返回 nextCursor 未前进，已中止避免死循环")
        cursor = next_cursor

    return all_items, last_payload


def _build_numbered_text(items: list[dict]) -> str:
    lines = [f"{idx}. {_normalize_line(item)}" for idx, item in enumerate(items, start=1)]
    return "\n".join(lines)


def _atomic_write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile("w", encoding="utf-8", delete=False, dir=path.parent) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    tmp_path.replace(path)


def _atomic_write_json(path: Path, payload: dict) -> None:
    content = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    _atomic_write_text(path, content)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="每天读取 Flow Studio 待办清单（本地 Python）")
    parser.add_argument("--api-url", default=DEFAULT_API_URL, help=f"待办 API 地址，默认: {DEFAULT_API_URL}")
    parser.add_argument("--doc-id", default=DEFAULT_DOC_ID, help=f"文档 ID，默认: {DEFAULT_DOC_ID}")
    parser.add_argument("--mode", choices=ALLOWED_MODES, default=DEFAULT_MODE, help="读取模式")
    parser.add_argument("--page-size", type=int, default=50, help="分页大小，1-100，默认 50")
    parser.add_argument("--refresh-token", default="", help="Firebase Refresh Token（长期）")
    parser.add_argument("--refresh-token-file", default="", help="从文件读取 Refresh Token")
    parser.add_argument("--timeout-sec", type=float, default=20.0, help="单次请求超时秒数，默认 20")
    parser.add_argument("--retries", type=int, default=3, help="请求失败重试次数，默认 3")
    parser.add_argument("--base-delay-sec", type=float, default=0.5, help="重试基础延时，默认 0.5 秒")
    parser.add_argument("--output-text", default=DEFAULT_OUTPUT_TEXT, help=f"输出文本文件，默认: {DEFAULT_OUTPUT_TEXT}")
    parser.add_argument("--output-json", default=DEFAULT_OUTPUT_JSON, help=f"输出 JSON 文件，默认: {DEFAULT_OUTPUT_JSON}")
    parser.add_argument("--quiet", action="store_true", help="不在 stdout 打印清单")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        refresh_token = _read_refresh_token(args)
        page_size = max(1, min(100, int(args.page_size)))

        items, last_payload = _fetch_all_todos(
            api_url=args.api_url.strip(),
            doc_id=args.doc_id.strip(),
            mode=args.mode,
            page_size=page_size,
            refresh_token=refresh_token,
            timeout_sec=max(1.0, args.timeout_sec),
            retries=max(0, args.retries),
            base_delay_sec=max(0.1, args.base_delay_sec),
        )

        numbered_text = _build_numbered_text(items)
        text_output = Path(args.output_text).expanduser()
        json_output = Path(args.output_json).expanduser()

        exported_at = datetime.now(timezone.utc).isoformat()
        json_payload = {
            "success": True,
            "exportedAt": exported_at,
            "apiUrl": args.api_url.strip(),
            "docId": args.doc_id.strip(),
            "mode": args.mode,
            "total": len(items),
            "items": items,
            "numberedText": numbered_text,
            "apiMeta": {
                "authMode": last_payload.get("authMode"),
                "userId": last_payload.get("userId"),
            },
        }

        _atomic_write_text(text_output, numbered_text + ("\n" if numbered_text else ""))
        _atomic_write_json(json_output, json_payload)

        if not args.quiet:
            if numbered_text:
                print(numbered_text)
            else:
                print("（当前没有未完成待办）")
            print(f"\n[输出] text: {text_output}")
            print(f"[输出] json: {json_output}")

        return 0
    except TodoFetchError as error:
        print(f"[ERROR] {error}", file=sys.stderr)
        return 2
    except Exception as error:  # noqa: BLE001
        print(f"[FATAL] {error}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
