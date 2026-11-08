# -*- coding: utf-8 -*-
"""
Helper utilities for LexiMaster IELTS Vocabulary Generation.
Ensures standardized schema, IPA formatting, and clean validation.
"""

def make_item(
    word,
    ipa,
    pos,
    level,
    meaning,
    collocations,
    example_en,
    example_vi,
    synonyms=None,
    antonyms=None,
    tags=None,
    detailed_note=None
):
    cleaned_word = word.strip()
    slug = cleaned_word.lower().replace(" ", "_").replace("-", "_")
    
    # Standardize tags
    if tags is None:
        tags = ["academic"]
    elif isinstance(tags, str):
        tags = [tags]
    
    # Add level tag
    level_tag = level.lower().replace(" ", "_").replace("+", "_plus")
    if level_tag not in tags:
        tags.append(level_tag)

    return {
        "id": slug,
        "word": cleaned_word,
        "ipa": ipa if ipa else f"/{cleaned_word}/",
        "pos": pos,
        "level": level,
        "meaning": meaning,
        "collocations": collocations if collocations else [],
        "exampleEn": example_en,
        "exampleVi": example_vi,
        "synonyms": synonyms if synonyms else [],
        "antonyms": antonyms if antonyms else [],
        "tags": tags,
        "detailedNote": detailed_note or f"Từ vựng trọng tâm IELTS chủ đề {', '.join(tags[:2])} (Band {level})."
    }
