/**
 * Vietnamese Unicode Normalization & Diacritic Integrity Utility
 * Ensures all Vietnamese text across state, localStorage, and UI boundaries
 * is canonically composed in Unicode NFC (U+1EA0..U+1EF9, U+00C0..U+01B0)
 * without decomposed combining mark separation (NFD) or duplicate/spaced marks.
 */

const VIETNAMESE_COMBINING_MARKS_REGEX = /[\u0300-\u0303\u0306\u0309\u031B\u0323]/;

const VIETNAMESE_VOWEL_SPACE_MARK_REGEX =
  /([aăâeêioôơuưyAĂÂEÊIOÔƠUƯY\u00C0-\u01B0])\s+([\u0300-\u0303\u0306\u0309\u031B\u0323]+)/g;

const PRECOMPOSED_TONED_VOWEL_DUPLICATE_MARK_REGEX =
  /([áàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ])\s*[\u0300\u0301\u0303\u0309\u0323]+/g;

export function hasUnnormalizedVietnameseMarks(input: unknown): boolean {
  if (typeof input !== 'string' || input.length === 0) {
    return false;
  }
  if (VIETNAMESE_COMBINING_MARKS_REGEX.test(input)) {
    return true;
  }
  return input !== input.normalize('NFC');
}

export function normalizeVietnameseText(input: unknown): string {
  if (typeof input !== 'string' || input.length === 0) {
    return '';
  }

  let cleaned = input;

  if (VIETNAMESE_COMBINING_MARKS_REGEX.test(cleaned)) {
    cleaned = cleaned.replace(PRECOMPOSED_TONED_VOWEL_DUPLICATE_MARK_REGEX, '$1');
    cleaned = cleaned.replace(VIETNAMESE_VOWEL_SPACE_MARK_REGEX, '$1$2');
  }

  const nfc = cleaned.normalize('NFC');

  if (VIETNAMESE_COMBINING_MARKS_REGEX.test(nfc)) {
    return nfc.replace(PRECOMPOSED_TONED_VOWEL_DUPLICATE_MARK_REGEX, '$1').normalize('NFC');
  }

  return nfc;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (typeof val !== 'object' || val === null) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
}

export function deepNormalizeText<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return normalizeVietnameseText(value) as unknown as T;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (seen.has(value as object)) {
    return seen.get(value as object) as T;
  }

  if (Array.isArray(value)) {
    const arrResult: unknown[] = [];
    seen.set(value as object, arrResult);
    for (let i = 0; i < value.length; i++) {
      arrResult.push(deepNormalizeText(value[i], seen));
    }
    return arrResult as unknown as T;
  }

  // Do not mutate or coerce non-plain objects (Date, RegExp, Map, Set, Error, custom class instances)
  if (!isPlainObject(value)) {
    return value;
  }

  const result: Record<string, unknown> = {};
  seen.set(value as object, result);
  for (const [key, val] of Object.entries(value)) {
    const normalizedKey = normalizeVietnameseText(key);
    result[normalizedKey] = deepNormalizeText(val, seen);
  }

  return result as T;
}

export function parseAndNormalizeJSON<T>(raw: string | null, fallback: T): T {
  if (!raw || typeof raw !== 'string') {
    return deepNormalizeText(fallback);
  }
  try {
    const parsed = JSON.parse(raw) as T;
    if (parsed === null || parsed === undefined) {
      return deepNormalizeText(fallback);
    }
    return deepNormalizeText(parsed);
  } catch {
    return deepNormalizeText(fallback);
  }
}
