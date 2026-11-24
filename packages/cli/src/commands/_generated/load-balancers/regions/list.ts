/**
 * list command
 * @generated from apis/overlays/load-balancers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"subdivision-code": {
			kind: "parsed",
			brief: "Two-letter subdivision code followed in ISO 3166-2.",
			optional: true,
			parse: String,
		},
		"subdivision-code-a2": {
			kind: "parsed",
			brief: "Two-letter subdivision code followed in ISO 3166-2.",
			optional: true,
			parse: String,
		},
		"country-code-a2": {
			kind: "parsed",
			brief: "Two-letter alpha-2 country code followed in ISO 3166-1.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Regions",
	usage: "$0 load-balancers regions list\n\nList all region mappings.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
