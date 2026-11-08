#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXISTING_PATH = os.path.join(BASE_DIR, "src", "data", "existingVocab.json")
OUTPUT_PATH = os.path.join(BASE_DIR, "src", "data", "vocabDatabase.json")

# Load existing 104 words
with open(EXISTING_PATH, "r", encoding="utf-8") as f:
    existing_items = json.load(f)

vocab_map = {}
duplicate_count = 0

for item in existing_items:
    k = item["word"].lower().strip()
    if k not in vocab_map:
        vocab_map[k] = item
    else:
        duplicate_count += 1

print(f"Loaded existing words: {len(vocab_map)} (duplicates skipped: {duplicate_count})")
