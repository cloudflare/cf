/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	describe: "Get PIR constants (methods, dimensions, and TLP values)",
	usage:
		"$0 cloudforce-one priority-intelligence constants get\n\nRequirements is the existing free-form PIR method. Interests is the experimental structured-interest method, evaluated independently from requirements.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
