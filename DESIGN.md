# MASTER ENGLISH — VINTAGE NEWSPAPER EDITORIAL DESIGN SYSTEM

## 1. Aesthetic Philosophy & North-Star Benchmark
**MASTER ENGLISH** embodies an authentic **19th-Century University Broadsheet, Vintage Newspaper Editorial, and Classic Print Lexicon** aesthetic. Every screen, card, quiz, flashcard, and modal is crafted as a physical printed page on warm, aged parchment with crisp press-ink borders, woodcut engravings, and editorial crimson rubber stamps.

- **Zero-White-SaaS Rule**: Pure white (`#FFFFFF`), cold slate grays (`#F8FAFC`, `#F3F4F6`), neon/pastel pills, and blurry SaaS shadows (`shadow-xl`, `rounded-3xl`) are strictly prohibited.
- **Image Blending Rule**: All 2K woodcut & architectural illustrations in `/public/assets/vintage-editorial/` use `mix-blend-mode: multiply` inside framed newsprint engraving boxes (`border: 1px solid #796B59`) so the black line art merges naturally into the `#F1E7D3` / `#E9DCC2` parchment.

---

## 2. Official Color Palette & Five-Layer Paper System

### Paper Surfaces
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--paper` | `#E9DCC2` | Primary Vintage Newsprint Canvas (with 5-layer SVG blot, fiber, grain & vignette) |
| `--paper-secondary` | `#F1E7D3` | Elevated Editorial Article Card / Index Slip / Modal Surface |
| `--paper-aged` | `#DCC9A8` | Secondary Recessed Well / Filter Strip / Footnote Block |
| `--paper-dark` | `#C9B38E` | Deep Aged Parchment / Inactive Tab / Structural Fill |

### Press Ink & Borders
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--ink-primary` | `#181614` | Deep Press Black Ink (Headlines, Headwords, Primary Borders) |
| `--ink-secondary` | `#51483D` | Charcoal Sepia Body Copy & Definitions |
| `--ink-muted` | `#796B59` | Muted Archival Metadata, IPA Phonetics & Hairline Rules |
| `--ink-border` | `#493B2D` | Structural Editorial Frame & Column Divider |

### Editorial Accents & Semantic Stamps
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--editorial-red` | `#C92532` | Primary Crimson Press Stamp, Active Tab & Primary CTA |
| `--editorial-red-dark` | `#991D27` | Deep Wax Seal Red (Hover / Active Press) |
| `--editorial-red-light` | `#E8B7AC` | Vintage Rose Ink Wash (Mistake / Errata / Wrong Option Fill) |
| `--forest-ink` | `#2E5A36` | Vintage Forest Ink (Correct Answer / Mastered Stamp Border & Text) |
| `--sage-wash` | `#DCE6D5` | Aged Sage Parchment Fill (Correct Answer / Mastered Surface) |

---

## 3. Typography System
- **Broadsheet Mastheads (`--font-headline`)**: `'Anton'`, `'Bebas Neue'`, `'Oswald'` — bold condensed uppercase with offset ink shadows.
- **Editorial Serif (`--font-serif`)**: `'Playfair Display'`, Georgia, serif — vocabulary headwords, academic prompts, section titles, and blockquotes.
- **Body & Vietnamese UI (`--font-body`)**: `'DM Sans'` — clean, high-legibility Vietnamese diacritics for meanings, explanations, and instructions.
- **Tabular Metrics & IPA (`--font-mono`)**: `'JetBrains Mono'` — timers, scores, keyboard shortcuts (`[1]`–`[4]`), and IPA transcriptions.
- **Handwritten Marginalia (`--font-handwriting`)**: `'Caveat'` — editorial annotations (`Keep Going.`, `Better Me Everyday!`).

---

## 4. Centralized Vintage Illustration Asset Architecture
All 26 custom 2K illustrations are organized under `/public/assets/vintage-editorial/`:
- `/hero/`: `master-english-cat-laptop.jpg`
- `/editorial/`: `vintage-editorial-quill-cat.jpg`
- `/architecture/`: `big-ben.jpg`, `empire-state.jpg`, `eiffel-tower.jpg`, `christ-redeemer.jpg`, `tokyo-tower.jpg`, `pyramids-giza.jpg`, `taj-mahal.jpg`, `colosseum.jpg`, `sydney-opera-house.jpg`, `japanese-covered-bridge.jpg`, `one-pillar-pagoda.jpg`, `saigon-notre-dame.jpg`, `khue-van-cac.jpg`
- `/mascot/`: `cat-compass.jpg`, `cat-oil-lamp.jpg`, `cat-dictionary-armchair.jpg`, `cat-near-books.jpg`, `cat-graduation-cap.jpg`, `cat-scroll.jpg`, `cat-sleeping-book.jpg`, `cat-butterfly-magnifier.jpg`, `cat-library.jpg`, `cat-telescope.jpg`, `cat-writing-quill.jpg`
