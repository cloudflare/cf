/**
 * create command
 * @generated from apis/overlays/diagnostics.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"check-type": {
			kind: "parsed",
			brief: "type of check to perform",
			default: "icmp",
			choices: ["icmp"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "check-type", "text"),
		},
		endpoint: {
			kind: "parsed",
			brief: "the IP address of the host to perform checks against",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Optional name associated with this check",
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
	describe: "Endpoint Health Check",
	usage:
		"$0 diagnostics endpoint-healthchecks create\n\nCreate Endpoint Health Check.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
