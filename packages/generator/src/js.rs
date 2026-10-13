//! The JavaScript semantics the generated code and its metadata depend on.
//!
//! The generator's output was first defined by what JavaScript does: how
//! `String(value)` and `JSON.stringify` print values, what is truthy, what
//! `\s` matches, and how `localeCompare` sorts. These helpers reproduce
//! exactly that, so the output stays byte-for-byte the same.

use std::cmp::Ordering;

use forge::Json;
use serde_json::{Map, Number, Value};

/// `json` as a [`Value`]. forge holds every number as JavaScript does, as
/// an `f64`; a whole one becomes an integer, which prints as JavaScript
/// prints it.
pub fn from_forge(json: &Json) -> Value {
    match json {
        Json::Null => Value::Null,
        Json::Bool(b) => Value::Bool(*b),
        Json::Number(n) if n.fract() == 0.0 && n.abs() < 9_007_199_254_740_992.0 => Value::from(*n as i64),
        Json::Number(n) => Number::from_f64(*n).map_or(Value::Null, Value::Number),
        Json::String(s) => Value::String(s.clone()),
        Json::Array(items) => items.iter().map(from_forge).collect(),
        Json::Object(members) => Value::Object(
            members
                .iter()
                .map(|(key, value)| (key.clone(), from_forge(value)))
                .collect::<Map<_, _>>(),
        ),
    }
}

/// Whether `value` is JavaScript-truthy.
pub fn truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().is_some_and(|n| n != 0.0 && !n.is_nan()),
        Value::String(s) => !s.is_empty(),
        Value::Array(_) | Value::Object(_) => true,
    }
}

/// `String(value)`.
pub fn to_js_string(value: &Value) -> String {
    match value {
        Value::Null => "null".to_owned(),
        Value::Bool(b) => b.to_string(),
        Value::Number(n) => match n.as_i64() {
            Some(int) => int.to_string(),
            None => number_to_string(n.as_f64().unwrap_or(f64::NAN)),
        },
        Value::String(s) => s.clone(),
        Value::Array(items) => items
            .iter()
            .map(|item| match item {
                Value::Null => String::new(),
                item => to_js_string(item),
            })
            .collect::<Vec<_>>()
            .join(","),
        Value::Object(_) => "[object Object]".to_owned(),
    }
}

/// Reports whether `key` is an array index, which JavaScript objects keep
/// first, in ascending order.
pub fn is_array_index(key: &str) -> bool {
    let canonical = key == "0" || !key.is_empty() && !key.starts_with('0') && key.bytes().all(|b| b.is_ascii_digit());
    canonical && key.parse::<u64>().is_ok_and(|n| n < 4_294_967_295)
}

/// `Number.prototype.toString()`.
pub fn number_to_string(x: f64) -> String {
    if x.is_nan() {
        return "NaN".to_owned();
    }
    if x == 0.0 {
        return "0".to_owned();
    }
    if x.is_infinite() {
        return if x > 0.0 { "Infinity" } else { "-Infinity" }.to_owned();
    }
    if x < 0.0 {
        return format!("-{}", number_to_string(-x));
    }
    // The shortest digits that round-trip, and the exponent of the first.
    let scientific = format!("{x:e}");
    let (mantissa, exponent) = scientific.split_once('e').expect("`{:e}` has an exponent");
    let digits: String = mantissa.chars().filter(|&c| c != '.').collect();
    let k = digits.len() as i32;
    let n = exponent.parse::<i32>().expect("`{:e}` has an integer exponent") + 1;
    if k <= n && n <= 21 {
        format!("{digits}{}", "0".repeat((n - k) as usize))
    } else if 0 < n && n <= 21 {
        let (int, frac) = digits.split_at(n as usize);
        format!("{int}.{frac}")
    } else if -6 < n && n <= 0 {
        format!("0.{}{digits}", "0".repeat((-n) as usize))
    } else {
        let e = n - 1;
        let sign = if e < 0 { '-' } else { '+' };
        let (first, rest) = digits.split_at(1);
        let mantissa = if rest.is_empty() {
            first.to_owned()
        } else {
            format!("{first}.{rest}")
        };
        format!("{mantissa}e{sign}{}", e.abs())
    }
}

/// `JSON.stringify(s)` for a string.
pub fn quote(s: &str) -> String {
    serde_json::to_string(s).expect("a string serializes")
}

/// Whether `c` is one of the characters JavaScript's `\s` and `trim` match.
fn is_js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' | '\u{205f}' | '\u{3000}' | '\u{feff}'
    )
}

/// `s.trim()`.
pub fn trim(s: &str) -> &str {
    s.trim_matches(is_js_whitespace)
}

/// `s.replace(/\s+/g, " ").trim()`.
pub fn normalize_spaces(s: &str) -> String {
    trim(s)
        .split(is_js_whitespace)
        .filter(|word| !word.is_empty())
        .collect::<Vec<_>>()
        .join(" ")
}

/// The primary collation weight of each printable ASCII character, in the
/// order of the root collation that `localeCompare` uses. Letters weigh the
/// same in either case.
const COLLATION: &str = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz";

fn primary(c: char) -> u32 {
    if c.is_ascii()
        && let Some(i) = COLLATION.find(c.to_ascii_lowercase())
    {
        return i as u32;
    }
    0x1000 + c as u32
}

/// The primary and tertiary weights of the characters of `s` the
/// collation doesn't ignore, as it does control characters.
fn collation_key(s: &str) -> (Vec<u32>, Vec<u8>) {
    s.chars()
        .filter(|&c| !matches!(c as u32, 0..=0x1f | 0x7f..=0x9f))
        // Lowercase sorts before uppercase.
        .map(|c| (primary(c), u8::from(c.is_ascii_uppercase())))
        .unzip()
}

/// `a.localeCompare(b)` for the strings the generator sorts.
pub fn locale_compare(a: &str, b: &str) -> Ordering {
    let (pa, ta) = collation_key(a);
    let (pb, tb) = collation_key(b);
    pa.cmp(&pb).then_with(|| ta.cmp(&tb))
}

/// Compares as `Array.prototype.sort` does without a comparator: by UTF-16
/// code units.
pub fn code_unit_compare(a: &str, b: &str) -> Ordering {
    a.encode_utf16().cmp(b.encode_utf16())
}

/// forge's `toKebabCase(s)`: underscores become hyphens, a hyphen goes
/// between a lowercase and an uppercase letter, and it all lowercases.
pub fn kebab(s: &str) -> String {
    let chars: Vec<char> = s.chars().map(|c| if c == '_' { '-' } else { c }).collect();
    let mut out = String::with_capacity(s.len());
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        out.push(c);
        if c.is_ascii_lowercase() && chars.get(i + 1).is_some_and(char::is_ascii_uppercase) {
            out.push('-');
            out.push(chars[i + 1]);
            i += 1;
        }
        i += 1;
    }
    out.to_lowercase()
}

/// The `{name}` placeholders of a path template: each one's byte range and
/// name, in order.
fn placeholders(template: &str) -> impl Iterator<Item = (usize, usize, &str)> {
    let mut from = 0;
    std::iter::from_fn(move || {
        loop {
            let start = from + template[from..].find('{')?;
            let close = start + 1 + template[start + 1..].find('}')?;
            if close > start + 1 {
                from = close + 1;
                return Some((start, close + 1, &template[start + 1..close]));
            }
            from = start + 1;
        }
    })
}

/// The names in the `{name}` placeholders of a path template, in order.
pub fn template_params(template: &str) -> Vec<String> {
    placeholders(template).map(|(_, _, name)| name.to_owned()).collect()
}

/// Replaces each `{name}` placeholder of `template` with what `f` returns.
pub fn replace_params(template: &str, mut f: impl FnMut(&str) -> String) -> String {
    let mut out = String::with_capacity(template.len());
    let mut last = 0;
    for (start, end, name) in placeholders(template) {
        out.push_str(&template[last..start]);
        out.push_str(&f(name));
        last = end;
    }
    out.push_str(&template[last..]);
    out
}

/// Reports whether `name` matches `/^[A-Za-z_$][\w$]*$/`.
pub fn is_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

/// The first word of `s`, split at whitespace.
pub fn first_word(s: &str) -> Option<&str> {
    s.split_whitespace().next()
}

/// Upper-cases the first character of `word`.
pub fn upper_first(word: &str) -> String {
    let mut chars = word.chars();
    match chars.next() {
        Some(first) => first.to_uppercase().chain(chars).collect(),
        None => String::new(),
    }
}

/// The lower-case words of the name `s` is written as, as forge's
/// `Name::new` reads them: `getByID` is "get by id".
pub fn name_words(s: &str) -> Vec<String> {
    let chars: Vec<char> = s.chars().collect();
    let mut words = Vec::new();
    // Where the word being read starts, and its last character.
    let mut start: Option<usize> = None;
    let mut prev: Option<char> = None;
    let mut flush = |start: &mut Option<usize>, end: usize| {
        if let Some(from) = start.take() {
            words.push(chars[from..end].iter().collect::<String>().to_lowercase());
        }
    };
    for (i, &c) in chars.iter().enumerate() {
        if !c.is_alphabetic() && !c.is_numeric() {
            flush(&mut start, i);
            continue;
        }
        if c.is_uppercase() && start.is_some() {
            // A lower-case letter or digit ends a word before an upper-case
            // one, and so does the last letter of an acronym before a new
            // word.
            let next_lower = chars.get(i + 1).is_some_and(|n| n.is_lowercase());
            if prev.is_some_and(|p| p.is_lowercase() || p.is_numeric() || (p.is_uppercase() && next_lower)) {
                flush(&mut start, i);
            }
        }
        start.get_or_insert(i);
        prev = Some(c);
    }
    flush(&mut start, chars.len());
    words
}

/// Appends `item` to `list` unless it is in it.
pub fn push_unique<T: PartialEq>(list: &mut Vec<T>, item: T) {
    if !list.contains(&item) {
        list.push(item);
    }
}

/// Returns `items` without repeats, in order.
pub fn dedup<T: PartialEq>(items: impl IntoIterator<Item = T>) -> Vec<T> {
    let mut out = Vec::new();
    for item in items {
        push_unique(&mut out, item);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prints_numbers_as_javascript_does() {
        for (n, s) in [
            (1.0, "1"),
            (0.1, "0.1"),
            (-2.5, "-2.5"),
            (100.0, "100"),
            (1e21, "1e+21"),
            (1.5e21, "1.5e+21"),
            (123456789012345680000.0, "123456789012345680000"),
            (1e-6, "0.000001"),
            (1e-7, "1e-7"),
            (1.25e-7, "1.25e-7"),
            (9007199254740993.0, "9007199254740992"),
        ] {
            assert_eq!(number_to_string(n), s);
        }
    }

    #[test]
    fn converts_to_strings() {
        let value: Value = serde_json::from_str(r#"[1,null,[true,"x"],{}]"#).unwrap();
        assert_eq!(to_js_string(&value), "1,,true,x,[object Object]");
    }

    #[test]
    fn converts_whole_numbers_to_integers() {
        assert_eq!(from_forge(&Json::Number(3.0)).to_string(), "3");
        assert_eq!(from_forge(&Json::Number(0.5)).to_string(), "0.5");
    }

    #[test]
    fn recognizes_array_indices() {
        for (key, index) in [
            ("0", true),
            ("10", true),
            ("01", false),
            ("", false),
            ("4294967295", false),
        ] {
            assert_eq!(is_array_index(key), index, "{key}");
        }
    }

    #[test]
    fn splits_names_into_words() {
        assert_eq!(name_words("getByID"), ["get", "by", "id"]);
        assert_eq!(name_words("HTTPServer2Go"), ["http", "server2", "go"]);
        assert_eq!(name_words("snake_case-name"), ["snake", "case", "name"]);
    }

    #[test]
    fn kebab_cases() {
        assert_eq!(kebab("zoneId"), "zone-id");
        assert_eq!(kebab("script_name"), "script-name");
        assert_eq!(kebab("aBCdE"), "a-bcd-e");
    }

    #[test]
    fn sorts_like_locale_compare() {
        let mut names = vec!["b", "A", "a", "_x", "a-b", "ab", "a_b"];
        names.sort_by(|a, b| locale_compare(a, b));
        assert_eq!(names, ["_x", "a", "A", "a_b", "a-b", "ab", "b"]);
    }

    #[test]
    fn finds_placeholders() {
        assert_eq!(template_params("/a/{b}/{}/{c{d}/e"), ["b", "c{d"]);
        assert_eq!(replace_params("/x/{id}/y", |n| n.to_uppercase()), "/x/ID/y");
    }
}
