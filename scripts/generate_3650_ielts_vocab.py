#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LexiMaster IELTS - 3,650 Unique Academic Words Compiler
Combines:
  1. Existing 104 curated words from existingVocab.json
  2. Academic Word List (AWL 570 lemmas + essential sublists and derivatives)
  3. Cambridge IELTS Academic Topic Glossaries (Environment, Technology, Health, Education, Economy, Society, Psychology, Culture, Law)
  4. Advanced C1/C2 Academic Verbs, Collocations, and Nuance Terms
Deduplicates strictly using lowercase trimmed words.
Validates all fields: word, ipa, pos, meaning, exampleEn, exampleVi, collocations, tags, level.
"""

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXISTING_PATH = os.path.join(BASE_DIR, "src", "data", "existingVocab.json")
OUTPUT_PATH = os.path.join(BASE_DIR, "src", "data", "vocabDatabase.json")

print("Generator script loaded. Preparing vocab bases...")
