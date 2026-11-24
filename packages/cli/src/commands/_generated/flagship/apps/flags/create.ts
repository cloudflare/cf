/**
 * create command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"default-variation": {
			kind: "parsed",
			brief:
				"Variation the API serves when the flag is off, or when it's on but no rule matches the context. Must be a key in `variations`.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief:
				"Optional operator-facing description. It does not affect flag evaluation.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"When false, the flag bypasses all rules and always serves `default_variation`.",
			optional: true,
		},
		key: {
			kind: "parsed",
			brief:
				"Unique identifier for the flag within an app. Used in all evaluation and SDK calls.",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Key-value metadata associated with the flag. `null` or an empty object clears existing metadata; omission semantics depend on the endpoint (PUT clears it, PATCH preserves it). Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (boolean | string | number)}.',
			optional: true,
			parse: String,
		},
		rules: {
			kind: "parsed",
			brief:
				'Targeting rules evaluated in ascending `priority`; the first matching rule wins. An empty array means the flag always serves `default_variation`. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"conditions": [{...}], "priority": number, "serve_variation": string, "rollout"?: {...}}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"Deprecated compatibility field. Omit it; the API ignores this value and infers the type from the flag's variations.",
			optional: true,
			choices: ["boolean", "string", "number", "json"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		variations: {
			kind: "parsed",
			brief:
				'Map of variation name to value. All values share the same type (boolean, string, number, or JSON object/array), and each serialized value stays within 10KB. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (string | number | boolean | ...more)}.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "app-id",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <app-id>",
	describe: "Create flag",
	usage:
		"$0 flagship apps flags create <app-id>\n\nCreates a flag. Returns 409 if the key already exists. `type` is always inferred from variation values; legacy request-side values are ignored. Optional `metadata` can be attached at creation.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
