#!/usr/bin/env python3
"""Revert Cursor Headroom BYOK override back to defaults."""
from __future__ import annotations

import json
import os
import shutil
import sqlite3
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

DEFAULT_OPENAI_URL = "https://api.openai.com/v1"
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
    subprocess.run(["taskkill", "/IM", "Cursor.exe", "/F"], capture_output=True, check=False)
    for _ in range(20):
        if not cursor_running():
            return
        time.sleep(0.5)


def main() -> int:
    force = "--force" in sys.argv
    db = Path(os.path.expandvars(r"%APPDATA%\Cursor\User\globalStorage\state.vscdb"))
    if not db.exists():
        print(f"Cursor state DB not found: {db}", file=sys.stderr)
        return 1

    if cursor_running():
        if force:
            print("Quitting Cursor...")
            quit_cursor()
        else:
            print(
                "Cursor is running. Quit Cursor fully, then run:\n"
                "  python3.exe scripts/revert-cursor-headroom-url.py --force",
                file=sys.stderr,
            )
            return 1

    backup = db.with_suffix(f".vscdb.bak-revert-{datetime.now().strftime('%Y%m%d-%H%M%S')}")
    shutil.copy2(db, backup)
    print(f"Backup: {backup}")

    con = sqlite3.connect(str(db))
    row = con.execute("SELECT value FROM ItemTable WHERE key=?", (STATE_KEY,)).fetchone()
    if not row:
        print("applicationUser row not found", file=sys.stderr)
        return 1
    data = json.loads(row[0])
    print(f"Before: useOpenAIKey={data.get('useOpenAIKey')!r}, openAIBaseUrl={data.get('openAIBaseUrl')!r}")

    data["useOpenAIKey"] = False
    data["openAIBaseUrl"] = DEFAULT_OPENAI_URL
    con.execute(
        "UPDATE ItemTable SET value=? WHERE key=?",
        (json.dumps(data, separators=(",", ":")), STATE_KEY),
    )
    con.commit()
    con.close()

    verify = json.loads(sqlite3.connect(str(db)).execute(
        "SELECT value FROM ItemTable WHERE key=?", (STATE_KEY,)
    ).fetchone()[0])
    print(f"After:  useOpenAIKey={verify.get('useOpenAIKey')!r}, openAIBaseUrl={verify.get('openAIBaseUrl')!r}")

    settings = Path(os.path.expandvars(r"%APPDATA%\Cursor\User\settings.json"))
    if settings.exists():
        user = json.loads(settings.read_text(encoding="utf-8"))
        removed = []
        for key in ("openai.baseUrl", "cursor.openai.baseUrl"):
            if key in user:
                del user[key]
                removed.append(key)
        if removed:
            settings.write_text(json.dumps(user, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"Removed from User settings.json: {', '.join(removed)}")

    if force:
        cursor_exe = Path(os.path.expandvars(r"%LOCALAPPDATA%\Programs\cursor\Cursor.exe"))
        if cursor_exe.exists():
            subprocess.Popen([str(cursor_exe)], close_fds=True)
            print("Reopened Cursor.")

    print("\nReverted. Use Cursor subscription / normal models again.")
    print("Headroom still works for Codex, Claude Code, and Graphify.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
