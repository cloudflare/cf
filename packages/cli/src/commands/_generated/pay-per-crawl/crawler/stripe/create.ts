/**
 * create command
 * @generated from apis/overlays/pay-per-crawl.ts
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
	command: "create",
	describe: "Creates the stripe config for a crawler",
	usage:
		"$0 pay-per-crawl crawler stripe create\n\nCreates the stripe config for a crawler.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
