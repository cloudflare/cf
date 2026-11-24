/**
 * update command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		normalize: {
			kind: "boolean",
			brief:
				"Ensures that the configuration is written or retrieved in normalized fashion",
			optional: true,
		},
		"auth-id-characteristics": {
			kind: "parsed",
			brief:
				'The auth_id_characteristics field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"name": string, "type": "header" | "cookie"} | {"name": string, "type": "jwt"})].',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update session identifier settings",
	usage:
		"$0 api-security session-identifiers update\n\nReplaces the zone's authentication identifier characteristics used to identify distinct API sessions.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
