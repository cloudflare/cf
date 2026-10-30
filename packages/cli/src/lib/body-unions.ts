import { validateJsonSchema, type JsonSchema } from "./schema-flags.js";

type BodyUnion = {
	readonly path: readonly string[];
} & (
	| {
			readonly selector: string;
			readonly variants: readonly {
				readonly values: readonly (string | number | boolean)[];
				readonly schema: JsonSchema;
			}[];
	  }
	| { readonly schema: JsonSchema }
);

/** Validate tagged unions after flags have been assembled into their wire shape. */
export function validateBodyUnions<T>(
	body: T,
	unions: readonly BodyUnion[]
): T {
	for (const union of unions) {
		let value: unknown = body;
		for (const key of union.path) {
			value =
				value !== null && typeof value === "object" && Object.hasOwn(value, key)
					? (value as Record<string, unknown>)[key]
					: undefined;
		}
		if (value === undefined) {
			continue;
		}
		let constraint: JsonSchema;
		if ("schema" in union) {
			constraint = union.schema;
		} else {
			const selected =
				value !== null && typeof value === "object"
					? (value as Record<string, unknown>)[union.selector]
					: undefined;
			const variant = union.variants.find((v) =>
				v.values.some((choice) => choice === selected)
			);
			constraint = variant?.schema ?? {
				oneOf: union.variants.map((v) => v.schema),
			};
		}
		const errors = validateJsonSchema(constraint, value);
		if (errors.length > 0) {
			throw new Error(
				`Invalid ${union.path.join(".") || "request body"}: ${errors.join("; ")}. Pass --body with a complete request body if it cannot be supplied as flags.`
			);
		}
	}
	return body;
}
