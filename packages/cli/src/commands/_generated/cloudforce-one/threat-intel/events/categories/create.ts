/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"kill-chain": {
			kind: "parsed",
			brief: "The killChain field",
			optional: true,
			parse: Number,
		},
		"mitre-attack": {
			kind: "parsed",
			brief: "The mitreAttack field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"mitre-capec": {
			kind: "parsed",
			brief: "The mitreCapec field",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		shortname: {
			kind: "parsed",
			brief: "The shortname field",
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
	describe: "Create an event category",
	usage:
		"$0 cloudforce-one threat-intel events categories create\n\nCreates an event category for classifying events. `name` and `killChain` are required.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
