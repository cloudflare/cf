/**
 * create command
 * @generated from apis/overlays/rules.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "An informative summary of the list.",
			optional: true,
			parse: String,
		},
		kind: {
			kind: "parsed",
			brief:
				"The type of the list. Each type supports specific list items (IP addresses, ASNs, hostnames or redirects).",
			optional: true,
			choices: ["ip", "redirect", "hostname", "asn"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"An informative name for the list. Use this name in filter and rule expressions.",
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
	describe: "Create a list",
	usage: "$0 rules lists create\n\nCreates a new list of the specified kind.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
