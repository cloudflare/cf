/**
 * list command
 * @generated from apis/overlays/user.ts
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
		"country-code": {
			kind: "parsed",
			brief: "Two-letter alpha-2 country code as defined in ISO 3166-1.",
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
	usage:
		"$0 user load-balancers regions list\n\nList all region mappings in the user context.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
