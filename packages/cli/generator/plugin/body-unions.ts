import { obj, type Value } from "./js.js";
import { deref, unwrapNull } from "./operation.js";
import type { ObjectType, Type } from "@cloudflare/forge/plugin";

export type BodyUnion = {
	path: string[];
	selector: string;
	variants: { values: (string | number | boolean)[]; schema: Value }[];
};

// Distinct required enum values select a branch even without an OpenAPI
// discriminator. Leave untagged unions to the existing flag derivation.
function taggedMembers(
	type: Type
): { selector: string; members: ObjectType[] } | undefined {
	const union = unwrapNull(deref(type));
	if (union.kind !== "union" || !union.exclusive) return undefined;
	const members = union.members.map((m) => unwrapNull(deref(m)));
	if (
		members.length < 2 ||
		!members.every((m): m is ObjectType => m.kind === "object")
	)
		return undefined;
	for (const candidate of members[0]?.fields ?? []) {
		const seen: (string | number | boolean)[] = [];
		if (
			members.every((member) => {
				const field = member.fields.find(
					(f) => f.wireName === candidate.wireName
				);
				if (!field?.required) return false;
				const t = unwrapNull(deref(field.type));
				if (t.kind !== "enum" || t.values.some((v) => seen.includes(v)))
					return false;
				seen.push(...t.values);
				return true;
			})
		)
			return { selector: candidate.wireName, members };
	}
	return undefined;
}

// Project only constraints the Rust model retains. Nested unions use anyOf:
// a projection can lose constraints, so counting matches could reject valid input.
function schema(type: Type, active: readonly Type[] = []): Value {
	const t = deref(type);
	if (active.includes(t) || active.length > 16) return obj();
	const next = [...active, t];
	switch (t.kind) {
		case "scalar":
			return t.scalar === "unknown"
				? obj()
				: obj([
						[
							"type",
							t.scalar === "number"
								? "number"
								: t.scalar === "boolean" || t.scalar === "null"
									? t.scalar
									: "string",
						],
					]);
		case "enum":
			return obj([["enum", [...t.values]]]);
		case "array":
			return obj([
				["type", "array"],
				["items", schema(t.elem, next)],
				...(t.maxItems === undefined
					? []
					: [["maxItems", t.maxItems] as const]),
			]);
		case "object":
			return obj([
				["type", "object"],
				[
					"properties",
					obj(t.fields.map((f) => [f.wireName, schema(f.type, next)])),
				],
				[
					"required",
					t.fields
						.filter((f) => f.required && !f.readOnly)
						.map((f) => f.wireName),
				],
				[
					"additionalProperties",
					t.extra === undefined ? false : schema(t.extra, next),
				],
			]);
		case "union":
			return obj([["anyOf", t.members.map((m) => schema(m, next))]]);
		case "intersection":
			return obj([["allOf", t.members.map((m) => schema(m, next))]]);
		case "model":
			return obj();
	}
}

export function bodyUnions(type: Type): BodyUnion[] {
	const unions: BodyUnion[] = [];
	const visit = (raw: Type, path: string[], active: readonly Type[]) => {
		const t = unwrapNull(deref(raw));
		if (active.includes(t) || path.length > 4) return;
		const next = [...active, t];
		const tagged = path.length > 0 ? taggedMembers(t) : undefined;
		if (tagged) {
			unions.push({
				path,
				selector: tagged.selector,
				variants: tagged.members.map((member) => {
					const field = member.fields.find(
						(f) => f.wireName === tagged.selector
					);
					const enumType = field && unwrapNull(deref(field.type));
					return {
						values: enumType?.kind === "enum" ? [...enumType.values] : [],
						schema: schema(member),
					};
				}),
			});
			// This schema already validates unions nested inside its branches.
			return;
		}
		if (t.kind === "object") {
			for (const field of t.fields) {
				if (!field.readOnly) visit(field.type, [...path, field.wireName], next);
			}
		} else if (t.kind === "intersection") {
			for (const member of t.members) visit(member, path, next);
		}
	};
	visit(type, [], []);
	return unions;
}
