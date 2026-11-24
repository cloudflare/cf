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
	describe: "Retrieves Security Center Issues Types",
	usage:
		"$0 intel attack-surface-report issue-types get\n\nLists all available issue types in Security Center, describing categories of security issues.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
