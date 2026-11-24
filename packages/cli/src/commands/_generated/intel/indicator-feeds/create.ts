/**
 * create command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description of the example test",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the indicator feed",
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
	describe: "Create new indicator feed",
	usage:
		"$0 intel indicator-feeds create\n\nCreates a new custom threat indicator feed for sharing threat intelligence data.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
