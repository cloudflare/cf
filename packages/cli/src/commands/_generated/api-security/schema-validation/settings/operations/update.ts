/**
 * update command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"mitigation-action": {
			kind: "parsed",
			brief:
				'When set, this applies a mitigation action to this operation\n\n  - `"log"` - log request when request does not conform to schema for this operation\n  - `"block"` - deny access to the site when request does not conform to schema for this operation\n  - `"none"` - will skip mitigation for this operation\n  - `null` - clears any mitigation action\n',
			optional: true,
			choices: ["log", "block", "none"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "mitigation-action", "text"),
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
			placeholder: "operation-id",
			brief: "Identifier for the operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <operation-id>",
	describe: "Update per-operation schema validation setting",
	usage:
		"$0 api-security schema-validation settings operations update <operation-id>\n\nFully updates schema validation settings for a specific API operation.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
