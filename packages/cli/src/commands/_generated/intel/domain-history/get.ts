/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		domain: { kind: "parsed", brief: "Domain", optional: true, parse: String },
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
	command: "get",
	describe: "Get Domain History",
	usage:
		"$0 intel domain-history get\n\nGets historical security threat and content categories currently and previously assigned to a domain.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
