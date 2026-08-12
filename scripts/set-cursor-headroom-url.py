#!/usr/bin/env python3
"""Set Cursor Override OpenAI Base URL to Headroom (Windows).

Cursor 3.15.x has a UI bug — BYOK fields can't be clicked/edited.
This writes directly to state.vscdb. Cursor MUST be fully quit first
or it will overwrite the change on exit.

Usage:
  python3.exe scripts/set-cursor-headroom-url.py
  python3.exe scripts/set-cursor-headroom-url.py --force   # quit Cursor, apply, reopen
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sqlite3
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

DEFAULT_URL = "http://127.0.0.1:8787/p/gandom_galery_shop/v1"
STATE_KEY = (
    "src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl"
    ".persistentStorage.applicationUser"
)


def cursor_running() -> bool:
    r = subprocess.run(
        ["tasklist", "/FI", "IMAGENAME eq Cursor.exe"],
        capture_output=True,
        text=True,
        check=False,
    )
    return "Cursor.exe" in r.stdout


def quit_cursor() -> None:
    subprocess.run(
        ["taskkill", "/IM", "Cursor.exe", "/F"],
        capture_output=True,
        check=False,
    )
    for _ in range(20):
        if not cursor_running():
            return
        time.sleep(0.5)
    print("Warning: Cursor may still be running.", file=sys.stderr)


def read_state(db: Path) -> dict:
    con = sqlite3.connect(str(db))
    row = con.execute(
        "SELECT value FROM ItemTable WHERE key=?", (STATE_KEY,)
    ).fetchone()
    con.close()
    if not row:
        raise RuntimeError("applicationUser row not found")
    return json.loads(row[0])


def write_state(db: Path, data: dict) -> None:
    con = sqlite3.connect(str(db))
    con.execute(
        "UPDATE ItemTable SET value=? WHERE key=?",
        (json.dumps(data, separators=(",", ":")), STATE_KEY),
    )
    con.commit()
    con.close()


def patch_settings_json(url: str) -> None:
    settings = Path(os.path.expandvars(r"%APPDATA%\Cursor\User\settings.json"))
    if not settings.exists():
        return
    data = json.loads(settings.read_text(encoding="utf-8"))
    data["openai.baseUrl"] = url
    settings.write_text(json.dumps(data, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Patched {settings}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument(
        "--force",
        action="store_true",
        help="Quit Cursor.exe, apply, then reopen Cursor",
    )
    args = parser.parse_args()

    db = Path(os.path.expandvars(r"%APPDATA%\Cursor\User\globalStorage\state.vscdb"))
    if not db.exists():
        print(f"Cursor state DB not found: {db}", file=sys.stderr)
        return 1

    if cursor_running():
        if args.force:
            print("Quitting Cursor...")
            quit_cursor()
        else:
            print(
                "Cursor is running — it will revert this change on exit.\n"
                "Fully quit Cursor (File → Exit), then re-run:\n"
                "  python3.exe scripts/set-cursor-headroom-url.py\n"
                "Or use --force to quit Cursor automatically.",
                file=sys.stderr,
            )
            return 1

    backup = db.with_suffix(f".vscdb.bak-headroom-{datetime.now().strftime('%Y%m%d-%H%M%S')}")
    shutil.copy2(db, backup)
    print(f"Backup: {backup}")

    data = read_state(db)
    print(f"Before: useOpenAIKey={data.get('useOpenAIKey')!r}, openAIBaseUrl={data.get('openAIBaseUrl')!r}")

    data["useOpenAIKey"] = True
    data["openAIBaseUrl"] = args.url
    write_state(db, data)

    verify = read_state(db)
    print(
        f"After:  useOpenAIKey={verify.get('useOpenAIKey')!r}, "
        f"openAIBaseUrl={verify.get('openAIBaseUrl')!r}"
    )

    if verify.get("openAIBaseUrl") != args.url or not verify.get("useOpenAIKey"):
        print("Verification failed.", file=sys.stderr)
        return 1

    patch_settings_json(args.url)

    if args.force:
        cursor_exe = Path(os.path.expandvars(r"%LOCALAPPDATA%\Programs\cursor\Cursor.exe"))
        if cursor_exe.exists():
            subprocess.Popen([str(cursor_exe)], close_fds=True)
            print("Reopened Cursor.")

    print("\nDone. In Settings → Models you should see:")
    print(f"  Override OpenAI Base URL: {args.url}")
    print("\nNote: Cursor 3.15.6 UI may not let you edit BYOK fields (known bug).")
    print("The value is set in the database — reload window after opening Cursor.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
