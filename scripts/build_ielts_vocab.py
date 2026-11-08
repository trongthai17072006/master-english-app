#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build large comprehensive IELTS vocabulary bank (3,500 - 4,000 unique words).
Ensures zero duplicates (normalized lowercase and trimmed), with full IPA, POS,
accurate Vietnamese meanings, natural IELTS examples, Vietnamese translations,
collocations, synonyms, antonyms, levels, and topic tags.
"""

import json
import re
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOCAB_TS_PATH = os.path.join(BASE_DIR, "src", "data", "vocabularyData.ts")
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "vocabDatabase.json")

print("Building vocabulary bank...")
