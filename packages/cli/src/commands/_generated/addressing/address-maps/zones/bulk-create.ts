/**
 * bulk-create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"address-map-id": {
			kind: "parsed",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
		zones: {
			kind: "parsed",
			brief: "The zones field",
			variadic: true,
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
	command: "bulk-create",
	describe: "Add Multiple Zones to an Address Map",
	usage:
		"$0 addressing address-maps zones bulk-create\n\nAdd multiple zones as members of a particular address map.",
	...parameters,
	loader: () => import("./bulk-create.handler.js"),
});

export default command;
