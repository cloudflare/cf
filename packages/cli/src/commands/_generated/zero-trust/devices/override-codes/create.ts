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
		"device-id": {
			kind: "parsed",
			brief:
				"Physical device ID. Required when scope is device and forbidden when scope is account.",
			optional: true,
			parse: String,
		},
		"duration-hours": {
			kind: "parsed",
			brief: "Number of hours for which the override code should remain valid.",
			optional: true,
			parse: Number,
		},
		scope: {
			kind: "parsed",
			brief:
				"Whether the code applies to every device in the account or one physical device.",
			optional: true,
			choices: ["account", "device"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope", "text"),
		},
		type: {
			kind: "parsed",
			brief: "The feature that the override code applies to.",
			optional: true,
			choices: ["uninstall_protection"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	describe: "Generate an uninstall protection override code",
	usage:
		"$0 zero-trust devices override-codes create\n\nGenerates an account-wide or device-specific uninstall protection override code.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
