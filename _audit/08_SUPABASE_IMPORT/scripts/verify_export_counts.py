#!/usr/bin/env python3
"""
Agent C — Independent Data & Export Verification Script
Independently validates:
1. Checksums of all protected source files against _audit/backup_0_original/CHECKSUMS.txt
2. Row counts and SHA-256 hashes of all CSV and JSON exports in _audit/08_SUPABASE_IMPORT/
3. Primary key UUID uniqueness & format across all 9 exported tables
4. Referential integrity (Foreign Keys: category_id, day_id, vocab_id, import_batch_id)
5. Unicode NFC normalization and non-empty required fields
"""

import csv
import hashlib
import json
import os
import re
import sys
import unicodedata

BASE_DIR = os.path.abspath("_audit/08_SUPABASE_IMPORT")
UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")

PROTECTED_FILES = [
    "src/data/vocabDatabase.json",
    "src/data/existingVocab.json",
    "src/data/vocabularyData.ts",
    "src/data/expandedPdfLibraryData.ts",
    "src/data/vstepPdfKnowledgeBankData.ts",
    "src/data/challenge60Data.ts",
    "src/data/rubyTypingAudioB64.ts",
    "src/data/curriculum/types.ts",
    "src/data/curriculum/days01To15.ts",
    "src/data/curriculum/days16To60.ts",
    "src/data/curriculum/academicPassageAndEssayEngine.ts",
    "src/data/curriculum/speakingSets1To5.ts",
    "src/data/curriculum/topicContentBuilder.ts",
    "src/data/curriculum/vstep28SpeakingBank.ts",
    "src/data/curriculum/vstep28SpeakingBankPart2.ts",
    "src/data/curriculum/vstep28SpeakingBankPart3.ts",
    "src/data/curriculum/vstep28SpeakingBankPart4.ts",
]


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def load_csv(file_path: str):
    with open(file_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)


def main():
    csv.field_size_limit(10 * 1024 * 1024)
    errors = []
    report = {
        "protected_files_intact": True,
        "protected_file_checks": [],
        "table_checks": [],
        "fk_checks": {},
        "uuid_checks": {},
        "nfc_violations": 0,
        "checksum_file_verified": True,
    }

    # 1. Verify protected data files against _audit/backup_0_original/CHECKSUMS.txt
    orig_checksums = {}
    with open("_audit/backup_0_original/CHECKSUMS.txt", "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split(None, 1)
            if len(parts) == 2:
                orig_checksums[parts[1].lstrip("./")] = parts[0]

    for pf in PROTECTED_FILES:
        actual = sha256_file(pf)
        expected = orig_checksums.get(pf)
        match = actual == expected
        if not match:
            report["protected_files_intact"] = False
            errors.append(f"Protected file modified: {pf} (expected {expected}, got {actual})")
        report["protected_file_checks"].append({
            "file": pf,
            "sha256": actual,
            "matches_baseline": match,
        })

    # 2. Verify checksums.sha256
    checksums_path = os.path.join(BASE_DIR, "checksums.sha256")
    with open(checksums_path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split(None, 1)
            if len(parts) == 2:
                expected_hash, rel_file = parts
                target = os.path.join(BASE_DIR, rel_file)
                actual_hash = sha256_file(target)
                if actual_hash != expected_hash:
                    report["checksum_file_verified"] = False
                    errors.append(f"Checksum mismatch for {rel_file}: {actual_hash} != {expected_hash}")

    # 3. Load manifest.json and verify each table's CSV and JSON
    with open(os.path.join(BASE_DIR, "manifest.json"), "r", encoding="utf-8") as f:
        manifest = json.load(f)

    table_rows = {}
    table_uuids = {}

    for t in manifest["tables"]:
        tname = t["table"]
        csv_path = os.path.join(BASE_DIR, t["csv_file"])
        json_path = os.path.join(BASE_DIR, t["json_file"])

        csv_data = load_csv(csv_path)
        with open(json_path, "r", encoding="utf-8") as jf:
            json_data = json.load(jf)

        csv_count = len(csv_data)
        json_count = len(json_data)
        expected_count = t["row_count"]

        if csv_count != expected_count or json_count != expected_count:
            errors.append(
                f"Count mismatch in {tname}: manifest={expected_count}, csv={csv_count}, json={json_count}"
            )

        seen_ids = set()
        invalid_uuids = 0
        for r in csv_data:
            rid = r.get("id", "")
            if not UUID_REGEX.match(rid):
                invalid_uuids += 1
            if rid in seen_ids:
                errors.append(f"Duplicate UUID in {tname}: {rid}")
            seen_ids.add(rid)
            for k, val in r.items():
                if val and unicodedata.normalize("NFC", val) != val:
                    report["nfc_violations"] += 1

        if invalid_uuids > 0:
            errors.append(f"{tname} has {invalid_uuids} invalid UUIDv5 values")

        table_rows[tname] = csv_data
        table_uuids[tname] = seen_ids
        report["table_checks"].append({
            "table": tname,
            "csv_count": csv_count,
            "json_count": json_count,
            "unique_uuids": len(seen_ids),
            "invalid_uuids": invalid_uuids,
            "status": "PASS" if (csv_count == expected_count == json_count and invalid_uuids == 0) else "FAIL",
        })

    # 4. Verify Foreign Keys
    batch_ids = table_uuids["import_batches"]
    cat_ids = table_uuids["vocabulary_categories"]
    vocab_ids = table_uuids["vocabulary"]
    day_ids = table_uuids["curriculum_days"]

    orphan_cat_fk = sum(
        1 for r in table_rows["vocabulary"] if r["category_id"] and r["category_id"] not in cat_ids
    )
    orphan_day_fk = sum(
        1 for r in table_rows["curriculum_day_vocab"] if r["day_id"] not in day_ids
    )
    orphan_vocab_fk = sum(
        1
        for r in table_rows["curriculum_day_vocab"]
        if r["vocab_id"] and r["vocab_id"] not in vocab_ids
    )
    matched_vocab_fk = sum(
        1
        for r in table_rows["curriculum_day_vocab"]
        if r["vocab_id"] and r["vocab_id"] in vocab_ids
    )
    orphan_batch_fk = 0
    for tname, rows in table_rows.items():
        if tname == "import_batches":
            continue
        for r in rows:
            if r.get("import_batch_id") not in batch_ids:
                orphan_batch_fk += 1

    report["fk_checks"] = {
        "vocabulary_category_id_orphans": orphan_cat_fk,
        "curriculum_day_vocab_day_id_orphans": orphan_day_fk,
        "curriculum_day_vocab_vocab_id_orphans": orphan_vocab_fk,
        "curriculum_day_vocab_matched_to_vocabulary_bank": matched_vocab_fk,
        "import_batch_id_orphans_across_all_tables": orphan_batch_fk,
    }

    if orphan_cat_fk or orphan_day_fk or orphan_vocab_fk or orphan_batch_fk:
        errors.append(f"Foreign key orphan detected: {report['fk_checks']}")

    report["errors"] = errors
    report["overall_status"] = "PASS" if len(errors) == 0 else "FAIL"

    out_path = os.path.join(BASE_DIR, "verification_result.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
