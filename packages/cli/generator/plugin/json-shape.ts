import type {
	IntersectionType,
	Type,
	UnionType,
} from "@cloudflare/forge/plugin";

const MAX_FIELDS = 5;
const MAX_ALTERNATIVES = 3;
const MAX_LENGTH = 240;
const MORE = "...more";

export interface JsonShape {
	text: string;
	hasOptionalKeys: boolean;
}

const shape = (text: string, hasOptionalKeys = false): JsonShape => ({
	text,
	hasOptionalKeys,
});

function list(
	parts: JsonShape[],
	open: string,
	close: string,
	separator: string,
	limit: number,
	maxLength: number
): JsonShape {
	const shown: JsonShape[] = [];
	for (const [i, part] of parts.entries()) {
		const texts = [...shown.map((entry) => entry.text), part.text];
		if (i < parts.length - 1) texts.push(MORE);
		if (
			shown.length === limit ||
			open.length + texts.join(separator).length + close.length > maxLength
		) {
			if (shown.length === 0 && open === "{") return shape("{...}");
			shown.push(shape(MORE));
			break;
		}
		shown.push(part);
	}
	return shape(
		`${open}${shown.map((part) => part.text).join(separator)}${close}`,
		shown.some((part) => part.hasOptionalKeys)
	);
}

function dereference(type: Type): Type {
	for (let i = 0; i < 12 && type.kind === "model"; i++) {
		type = type.model.type;
	}
	return type;
}

function* members(type: UnionType | IntersectionType): Iterable<Type> {
	const pending = [...type.members].reverse();
	const seen = new Set<Type>();
	while (pending.length > 0) {
		const member = pending.pop();
		if (member === undefined) break;
		const resolved = dereference(member);
		if (seen.has(resolved)) continue;
		seen.add(resolved);
		if (resolved.kind === type.kind) {
			for (let i = resolved.members.length - 1; i >= 0; i--) {
				const child = resolved.members[i];
				if (child !== undefined) pending.push(child);
			}
		} else {
			yield member;
		}
	}
}

/** A shallow schema sketch of values the structured flag parser accepts. */
export function jsonShape(type: Type): JsonShape {
	// Map and array flags reject top-level null, even when the API allows it.
	for (let i = 0; i < 12; i++) {
		type = dereference(type);
		if (type.kind !== "union") break;
		const members = type.members.filter((member) => {
			const resolved = dereference(member);
			return resolved.kind !== "scalar" || resolved.scalar !== "null";
		});
		if (members.length !== 1) break;
		type = members[0] ?? type;
	}
	return render(type, true, 0, MAX_LENGTH);
}

function render(
	type: Type,
	expandObject: boolean,
	depth: number,
	maxLength: number
): JsonShape {
	// References and compositions can recurse without passing through an object.
	if (depth > 12) return shape(MORE);
	switch (type.kind) {
		case "model":
			return render(type.model.type, expandObject, depth + 1, maxLength);
		case "scalar":
			return shape(
				["unknown", "null", "boolean", "number"].includes(type.scalar)
					? type.scalar
					: "string"
			);
		case "enum":
			return list(
				type.values.slice(0, MAX_ALTERNATIVES + 1).map((value) => {
					const literal = JSON.stringify(value);
					return shape(literal.length > 60 ? typeof value : literal);
				}),
				"",
				"",
				" | ",
				MAX_ALTERNATIVES,
				maxLength
			);
		case "array": {
			const elem = render(type.elem, expandObject, depth + 1, maxLength - 2);
			return shape(`[${elem.text}]`, elem.hasOptionalKeys);
		}
		case "object": {
			if (!expandObject) return shape("{...}");
			// readOnly fields are response-only, even when required by a shared schema.
			const fields = type.fields
				.filter((field) => !field.readOnly)
				.sort((a, b) => Number(b.required) - Number(a.required));
			const parts = fields.slice(0, MAX_FIELDS + 1).map((field) => {
				const optional = field.required ? "" : "?";
				const value = render(field.type, false, depth + 1, maxLength);
				return shape(
					`${JSON.stringify(field.wireName)}${optional}: ${value.text}`,
					!field.required || value.hasOptionalKeys
				);
			});
			if (type.extra !== undefined) {
				const value = render(type.extra, false, depth + 1, maxLength);
				parts.push(shape(`"<key>": ${value.text}`, value.hasOptionalKeys));
			}
			return list(parts, "{", "}", ", ", MAX_FIELDS, maxLength);
		}
		case "union":
		case "intersection": {
			const parts: JsonShape[] = [];
			const seen = new Set<string>();
			const separator = type.kind === "union" ? " | " : " & ";
			// Leave room for composition delimiters and omitted alternatives.
			const memberLength = maxLength - 2 - separator.length - MORE.length;
			for (const member of members(type)) {
				const part = render(member, expandObject, depth + 1, memberLength);
				if (
					seen.has(part.text) ||
					(type.kind === "intersection" && part.text === "{}")
				)
					continue;
				seen.add(part.text);
				parts.push(part);
				if (parts.length > MAX_ALTERNATIVES) break;
			}
			const first = parts[0];
			if (first === undefined)
				return shape(type.kind === "intersection" ? "{}" : MORE);
			if (parts.length === 1) return first;
			return list(parts, "(", ")", separator, MAX_ALTERNATIVES, maxLength);
		}
	}
}
