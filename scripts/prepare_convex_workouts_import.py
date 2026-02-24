#!/usr/bin/env python3

import argparse
import ast
import csv
import json
import sys
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


FIELD_MAP = {
    "burpees": "burpees",
    "cardio_minutes": "cardioMinutes",
    "lt1_miles": "lt1Miles",
    "lt2_miles": "lt2Miles",
    "speed_miles": "speedMiles",
    "total_bike_miles": "totalBikeMiles",
    "total_row_ks": "totalRowKs",
    "total_run_miles": "totalRunMiles",
    "total_ski_ks": "totalSkiKs",
    "vo2_miles": "vo2Miles",
    "wallballs": "wallballs",
}


def normalize_number(raw: str) -> float | int | None:
    value = (raw or "").strip()
    if not value:
        return None
    parsed = float(value)
    if parsed.is_integer():
        return int(parsed)
    return parsed


def parse_date(raw: str) -> datetime:
    value = (raw or "").strip()
    for fmt in ("%Y-%m-%d", "%m-%d-%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unsupported date format: {value!r}")


def week_monday_iso(date_value: datetime) -> str:
    monday = date_value - timedelta(days=date_value.weekday())
    return monday.strftime("%Y-%m-%d")


def parse_tags(raw: str) -> list[str]:
    value = (raw or "").strip()
    if not value:
        return []
    if value.startswith("[") and value.endswith("]"):
        parsed = ast.literal_eval(value)
        if isinstance(parsed, list):
            tags = [str(item).strip() for item in parsed if str(item).strip()]
            return list(dict.fromkeys(tags))
    return [part.strip() for part in value.split(",") if part.strip()]


def build_workout_doc(
    row: dict[str, str],
    line_number: int,
    counters: Counter,
    default_rpe: float,
    default_training_minutes: float,
    default_tag: str,
) -> dict[str, Any]:
    title = (row.get("title") or "").strip()
    if not title:
        raise ValueError("title is required")

    workout_date_input = (row.get("workout_date") or "").strip()
    if not workout_date_input:
        raise ValueError("workout_date is required")
    workout_date = parse_date(workout_date_input).strftime("%Y-%m-%d")
    week = week_monday_iso(parse_date(workout_date))

    workout_plan = (row.get("workout_plan") or "").strip()
    if not workout_plan:
        workout_plan = title
        counters["filled_workout_plan"] += 1

    tags = parse_tags(row.get("tags") or "")
    if not tags:
        tags = [default_tag]
        counters["filled_tags"] += 1

    training_minutes_raw = normalize_number(row.get("training_minutes") or "")
    if training_minutes_raw is None:
        cardio_minutes_raw = normalize_number(row.get("cardio_minutes") or "")
        if cardio_minutes_raw is not None:
            training_minutes = cardio_minutes_raw
            counters["filled_training_from_cardio"] += 1
        else:
            training_minutes = default_training_minutes
            counters["filled_training_default"] += 1
    else:
        training_minutes = training_minutes_raw

    rpe_raw = normalize_number(row.get("rpe") or "")
    if rpe_raw is None:
        rpe = default_rpe
        counters["filled_rpe_default"] += 1
    else:
        rpe = rpe_raw

    doc: dict[str, Any] = {
        "rpe": rpe,
        "tags": tags,
        "title": title,
        "trainingMinutes": training_minutes,
        "week": week,
        "workoutDate": workout_date,
        "workoutPlan": workout_plan,
    }

    notes = (row.get("notes") or "").strip()
    if notes:
        doc["notes"] = notes

    for input_key, output_key in FIELD_MAP.items():
        parsed = normalize_number(row.get(input_key) or "")
        if parsed is not None:
            doc[output_key] = parsed

    if row.get("week", "").strip() and row["week"].strip() != week:
        counters["normalized_week_values"] += 1

    if line_number <= 0:
        raise ValueError("invalid line number")

    return doc


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert workout CSV export to Convex-compatible JSONL."
    )
    parser.add_argument("--input", required=True, help="Path to source CSV.")
    parser.add_argument("--output", required=True, help="Path to output JSONL.")
    parser.add_argument(
        "--default-rpe",
        type=float,
        default=2.0,
        help="Default RPE when missing (default: 2.0).",
    )
    parser.add_argument(
        "--default-training-minutes",
        type=float,
        default=0.0,
        help="Default training minutes when missing and no cardio value exists (default: 0.0).",
    )
    parser.add_argument(
        "--default-tag",
        default="Strength",
        help="Fallback tag when tags cannot be parsed (default: Strength).",
    )
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    output_path = Path(args.output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    counters: Counter = Counter()
    total_rows = 0

    with input_path.open(newline="", encoding="utf-8") as input_file, output_path.open(
        "w", encoding="utf-8"
    ) as output_file:
        reader = csv.DictReader(input_file)
        for line_number, row in enumerate(reader, start=2):
            total_rows += 1
            try:
                doc = build_workout_doc(
                    row=row,
                    line_number=line_number,
                    counters=counters,
                    default_rpe=args.default_rpe,
                    default_training_minutes=args.default_training_minutes,
                    default_tag=args.default_tag,
                )
            except Exception as exc:
                print(
                    f"Row {line_number} failed ({row.get('id', '<no id>')}): {exc}",
                    file=sys.stderr,
                )
                return 1
            output_file.write(json.dumps(doc, ensure_ascii=True) + "\n")

    print(f"Converted {total_rows} rows to {output_path}.", file=sys.stderr)
    if counters:
        for key in sorted(counters):
            print(f"{key}: {counters[key]}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
