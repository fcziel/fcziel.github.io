"""Google News RSS（サッカー検索）からタイトル＋リンクのみを取得し、soccer-news.jsonに保存する。
本文は取得しない（見出し＋外部リンクのみのアグリゲーター的な使い方に留める）。
"""
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from pathlib import Path

RSS_URL = "https://news.google.com/rss/search?q=%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC&hl=ja&gl=JP&ceid=JP:ja"
OUT_PATH = Path(__file__).parent.parent / "soccer-news.json"
MAX_ITEMS = 10
JST = timezone(timedelta(hours=9))


def strip_source_suffix(title: str) -> str:
    # Google Newsのタイトル末尾「 - 媒体名」を除去
    return re.sub(r"\s+-\s+[^-]+$", "", title).strip()


def main():
    req = urllib.request.Request(RSS_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as res:
        data = res.read()

    root = ET.fromstring(data)
    items = []
    for item in root.findall(".//item")[:MAX_ITEMS]:
        title = strip_source_suffix(item.findtext("title") or "")
        link = (item.findtext("link") or "").strip()
        if title and link:
            items.append({"title": title, "link": link})

    payload = {
        "updated_at": datetime.now(JST).strftime("%Y-%m-%d %H:%M"),
        "items": items,
    }
    OUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"取得件数: {len(items)} -> {OUT_PATH}")


if __name__ == "__main__":
    main()
