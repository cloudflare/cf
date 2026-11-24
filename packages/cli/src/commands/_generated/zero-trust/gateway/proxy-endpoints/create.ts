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
		kind: {
			kind: "parsed",
			brief: "The proxy endpoint kind.",
			default: "ip",
			choices: ["ip", "identity"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
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
	describe: "Create a proxy endpoint",
	usage:
		"$0 zero-trust gateway proxy-endpoints create\n\nCreate a new Zero Trust Gateway proxy endpoint.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
