/**
 * patch command
 * @generated from apis/overlays/flagship.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
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
		metadata: {
			kind: "parsed",
			brief:
				'Key-value metadata associated with the flag. `null` or an empty object clears existing metadata; omission semantics depend on the endpoint (PUT clears it, PATCH preserves it). Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (boolean | string | number)}.',
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
			placeholder: "flag-key",
			brief: "Case-sensitive key identifying the flag within the app.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "patch <flag-key>",
	describe: "Partially update flag",
	usage:
		"$0 flagship apps flags patch <flag-key>\n\nApplies a partial update to lightweight flag fields: `enabled`, `description`, `metadata`, and `default_variation`. Only fields present in the request body are modified; omitted fields are preserved. `metadata: null` or an empty object clears metadata. `default_variation` must exist in the current `variations`. Structural changes to `variations` and `rules` use PUT. A changelog entry is appended when the flag content actually changes.",
	...parameters,
	loader: () => import("./patch.handler.js"),
});

export default command;
