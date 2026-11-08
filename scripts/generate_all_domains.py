#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates complete 3,650-word IELTS vocabulary database.
"""

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXISTING_PATH = os.path.join(BASE_DIR, "src", "data", "existingVocab.json")
OUTPUT_PATH = os.path.join(BASE_DIR, "src", "data", "vocabDatabase.json")

print("Initializing vocabulary generator...")
