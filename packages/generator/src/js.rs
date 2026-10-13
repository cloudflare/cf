//! The JavaScript semantics the generated code and its metadata depend on.
//!
//! The generator's output was first defined by what JavaScript does: the
//! order `Object.entries` walks an object in, how `JSON.stringify` prints
//! numbers, what `\s` matches, and how `localeCompare` sorts. These helpers
//! reproduce exactly that, so the output stays byte-for-byte the same.

use std::cmp::Ordering;
use std::fmt::Write;

use forge::Json;

/// A JSON value, as JavaScript holds one: every number is an `f64`.
#[derive(Clone, Debug, PartialEq)]
pub enum Value {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<Value>),
    Object(Obj),
}

/// A JSON object, which keeps its keys in the order JavaScript does: array
/// indices first, in ascending order, then the other keys in the order they
/// were first set.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Obj(Vec<(String, Value)>);

impl Obj {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get(&self, key: &str) -> Option<&Value> {
        self.0.iter().find(|(k, _)| k == key).map(|(_, v)| v)
    }

    /// Sets `key`: in place if the object has it, or else where JavaScript
    /// would add it.
    pub fn insert(&mut self, key: impl Into<String>, value: impl Into<Value>) {
        let key = key.into();
        let value = value.into();
        if let Some(slot) = self.0.iter_mut().find(|(k, _)| *k == key) {
            slot.1 = value;
            return;
        }
        let at = match array_index(&key) {
            Some(index) => self
                .0
                .iter()
                .position(|(k, _)| array_index(k).is_none_or(|other| other > index))
                .unwrap_or(self.0.len()),
            None => self.0.len(),
        };
        self.0.insert(at, (key, value));
    }

    pub fn iter(&self) -> impl Iterator<Item = (&str, &Value)> {
        self.0.iter().map(|(k, v)| (k.as_str(), v))
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

impl<K: Into<String>, V: Into<Value>> FromIterator<(K, V)> for Obj {
    fn from_iter<I: IntoIterator<Item = (K, V)>>(iter: I) -> Self {
        let mut obj = Obj::new();
        for (key, value) in iter {
            obj.insert(key, value);
        }
        obj
    }
}

/// Builds an [`Obj`] from `key => value` pairs, set in order.
macro_rules! obj {
    ($($key:expr => $value:expr),* $(,)?) => {{
        #[allow(unused_mut)]
        let mut obj = $crate::js::Obj::new();
        $(obj.insert($key, $value);)*
        obj
    }};
}
pub(crate) use obj;

impl From<bool> for Value {
    fn from(value: bool) -> Self {
        Value::Bool(value)
    }
}

impl From<f64> for Value {
    fn from(value: f64) -> Self {
        Value::Number(value)
    }
}

impl From<usize> for Value {
    fn from(value: usize) -> Self {
        Value::Number(value as f64)
    }
}

impl From<&str> for Value {
    fn from(value: &str) -> Self {
        Value::String(value.to_owned())
    }
}

impl From<&String> for Value {
    fn from(value: &String) -> Self {
        Value::String(value.clone())
    }
}

impl From<String> for Value {
    fn from(value: String) -> Self {
        Value::String(value)
    }
}

impl From<Obj> for Value {
    fn from(value: Obj) -> Self {
        Value::Object(value)
    }
}

impl<T: Into<Value>> From<Vec<T>> for Value {
    fn from(items: Vec<T>) -> Self {
        Value::Array(items.into_iter().map(Into::into).collect())
    }
}

impl<T: Into<Value> + Clone> From<&[T]> for Value {
    fn from(items: &[T]) -> Self {
        Value::Array(items.iter().cloned().map(Into::into).collect())
    }
}

impl From<&Json> for Value {
    fn from(json: &Json) -> Self {
        match json {
            Json::Null => Value::Null,
            Json::Bool(b) => Value::Bool(*b),
            Json::Number(n) => Value::Number(*n),
            Json::String(s) => Value::String(s.clone()),
            Json::Array(items) => Value::Array(items.iter().map(Value::from).collect()),
            Json::Object(members) => {
                Value::Object(members.iter().map(|(key, value)| (key, Value::from(value))).collect())
            }
        }
    }
}

impl Value {
    /// Parses JSON text, as `JSON.parse` does.
    pub fn parse(text: &str) -> Result<Value, String> {
        let json: Json = serde_json::from_str(text).map_err(|err| err.to_string())?;
        Ok(Value::from(&json))
    }

    pub fn as_object(&self) -> Option<&Obj> {
        match self {
            Value::Object(obj) => Some(obj),
            _ => None,
        }
    }

    pub fn as_array(&self) -> Option<&[Value]> {
        match self {
            Value::Array(items) => Some(items),
            _ => None,
        }
    }

    pub fn as_str(&self) -> Option<&str> {
        match self {
            Value::String(s) => Some(s),
            _ => None,
        }
    }

    /// The member `key`, if this is an object that has it.
    pub fn get(&self, key: &str) -> Option<&Value> {
        self.as_object().and_then(|obj| obj.get(key))
    }

    /// Whether the value is JavaScript-truthy.
    pub fn truthy(&self) -> bool {
        match self {
            Value::Null => false,
            Value::Bool(b) => *b,
            Value::Number(n) => *n != 0.0 && !n.is_nan(),
            Value::String(s) => !s.is_empty(),
            Value::Array(_) | Value::Object(_) => true,
        }
    }

    /// `String(value)`.
    pub fn to_js_string(&self) -> String {
        match self {
            Value::Null => "null".to_owned(),
            Value::Bool(b) => b.to_string(),
            Value::Number(n) => number_to_string(*n),
            Value::String(s) => s.clone(),
            Value::Array(items) => items
                .iter()
                .map(|item| match item {
                    Value::Null => String::new(),
                    item => item.to_js_string(),
                })
                .collect::<Vec<_>>()
                .join(","),
            Value::Object(_) => "[object Object]".to_owned(),
        }
    }
}

/// The array index `key` is, which objects keep first.
fn array_index(key: &str) -> Option<u32> {
    if key.is_empty() || key.len() > 10 || !key.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    if key.len() > 1 && key.starts_with('0') {
        return None;
    }
    key.parse::<u64>().ok().filter(|&n| n < 4_294_967_295).map(|n| n as u32)
}

/// Reports whether `key` is an array index.
pub fn is_array_index(key: &str) -> bool {
    array_index(key).is_some()
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
    let mut out = String::with_capacity(s.len() + 2);
    write_quoted(&mut out, s);
    out
}

fn write_quoted(out: &mut String, s: &str) {
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\u{8}' => out.push_str("\\b"),
            '\u{c}' => out.push_str("\\f"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

/// `JSON.stringify(value)`.
pub fn stringify(value: &Value) -> String {
    let mut out = String::new();
    write_json(&mut out, value, None, 0);
    out
}

/// `JSON.stringify(value, null, indent)`.
pub fn stringify_pretty(value: &Value, indent: usize) -> String {
    let mut out = String::new();
    write_json(&mut out, value, Some(indent), 0);
    out
}

fn write_json(out: &mut String, value: &Value, indent: Option<usize>, depth: usize) {
    let newline = |out: &mut String, depth: usize| {
        if let Some(indent) = indent {
            out.push('\n');
            out.push_str(&" ".repeat(indent * depth));
        }
    };
    match value {
        Value::Null => out.push_str("null"),
        Value::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Value::Number(n) if n.is_finite() => out.push_str(&number_to_string(*n)),
        Value::Number(_) => out.push_str("null"),
        Value::String(s) => write_quoted(out, s),
        Value::Array(items) if items.is_empty() => out.push_str("[]"),
        Value::Array(items) => {
            out.push('[');
            for (i, item) in items.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                newline(out, depth + 1);
                write_json(out, item, indent, depth + 1);
            }
            newline(out, depth);
            out.push(']');
        }
        Value::Object(obj) if obj.is_empty() => out.push_str("{}"),
        Value::Object(obj) => {
            out.push('{');
            for (i, (key, item)) in obj.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                newline(out, depth + 1);
                write_quoted(out, key);
                out.push(':');
                if indent.is_some() {
                    out.push(' ');
                }
                write_json(out, item, indent, depth + 1);
            }
            newline(out, depth);
            out.push('}');
        }
    }
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

/// Sets `key` of `entries`, a list of pairs: in place if it has it, or else
/// at the end.
pub fn set_entry<V>(entries: &mut Vec<(String, V)>, key: &str, value: V) {
    match entries.iter_mut().find(|(k, _)| k == key) {
        Some(entry) => entry.1 = value,
        None => entries.push((key.to_owned(), value)),
    }
}

/// The value of `key` in `entries`, a list of pairs.
pub fn get_entry<'a, V>(entries: &'a [(String, V)], key: &str) -> Option<&'a V> {
    entries.iter().find(|(k, _)| k == key).map(|(_, v)| v)
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
    fn keeps_array_indices_first() {
        let value = Value::parse(r#"{"b":1,"10":2,"a":3,"2":4,"01":5}"#).unwrap();
        assert_eq!(stringify(&value), r#"{"2":4,"10":2,"b":1,"a":3,"01":5}"#);
    }

    #[test]
    fn stringifies_pretty() {
        let value = Value::parse(r#"{"a":[1,{"b":[]}],"c":{},"d":"\u0001\n"}"#).unwrap();
        assert_eq!(
            stringify_pretty(&value, 2),
            "{\n  \"a\": [\n    1,\n    {\n      \"b\": []\n    }\n  ],\n  \"c\": {},\n  \"d\": \"\\u0001\\n\"\n}"
        );
    }

    #[test]
    fn converts_to_strings() {
        let value = Value::parse(r#"[1,null,[true,"x"],{}]"#).unwrap();
        assert_eq!(value.to_js_string(), "1,,true,x,[object Object]");
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
