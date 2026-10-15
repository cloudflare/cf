import type { RequestBodyTransform } from "@cloudflare/forge/request-transform";

/**
 * Interpret a generator-validated mapping. Object entries preserve null and
 * empty objects, and computed keys are always ordinary own properties.
 * Dry runs substitute sensitive arguments before constructing the body.
 */
export function transformRequestBody<T = unknown>(
	transform: RequestBodyTransform | string,
	args: Record<string, unknown>,
	redactArgs: readonly string[] = []
): T {
	const read = (name: string): unknown =>
		redactArgs.includes(name)
			? "<redacted>"
			: Object.hasOwn(args, name)
				? args[name]
				: undefined;
	const visit = (node: RequestBodyTransform): unknown => {
		if ("arg" in node) {
			return read(node.arg);
		}
		if ("literal" in node) {
			return node.literal;
		}
		return Object.fromEntries(
			node.object.flatMap((entry) => {
				if (entry.omitIfUnset && read(entry.omitIfUnset) === undefined) {
					return [];
				}
				const key =
					typeof entry.key === "string" ? entry.key : read(entry.key.arg);
				if (typeof key !== "string") {
					throw new Error("Request body mapping requires a string map key.");
				}
				const value = visit(entry.value);
				return value === undefined ? [] : [[key, value]];
			})
		);
	};
	return visit(
		typeof transform === "string"
			? (JSON.parse(transform) as RequestBodyTransform)
			: transform
	) as T;
}
