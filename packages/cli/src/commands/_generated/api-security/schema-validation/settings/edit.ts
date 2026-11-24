/**
 * edit command
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
		"validation-default-mitigation-action": {
			kind: "parsed",
			brief:
				'The default mitigation action used\nMitigation actions are as follows:\n\n  - `"log"` - log request when request does not conform to schema\n  - `"block"` - deny access to the site when request does not conform to schema\n  - `"none"` - skip running schema validation\n',
			optional: true,
			choices: ["none", "log", "block"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "validation-default-mitigation-action", "text"),
		},
		"validation-override-mitigation-action": {
			kind: "parsed",
			brief:
				'When set, this overrides both zone level and operation level mitigation actions.\n\n  - `"none"` - skip running schema validation entirely for the request\n  - `null` - clears any existing override\n',
			optional: true,
			choices: ["none"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"validation-override-mitigation-action",
					"text"
				),
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
	command: "edit",
	describe: "Edit global schema validation settings",
	usage:
		"$0 api-security schema-validation settings edit\n\nPartially updates global schema validation settings for a zone using PATCH semantics.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
