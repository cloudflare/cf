/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		application: {
			kind: "parsed",
			brief: "Platform this structure models. Immutable after creation.",
			optional: true,
			choices: ["aws", "cloudflare"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "application", "text"),
		},
		"import-path": {
			kind: "parsed",
			brief:
				"Optional unique Rego mount path in the form tenant.<application>.<name>; application must match. Omit to leave unmounted.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name; unique per account",
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
	command: "create",
	describe: "Create a tenant structure",
	usage:
		"$0 zero-trust cws tenant-structures create\n\nCreates an empty tenant hierarchy for the selected cloud application.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
