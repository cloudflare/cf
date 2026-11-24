/**
 * usage command
 * @generated from apis/overlays/containers.ts
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
	command: "usage",
	describe: "Get live account usage",
	usage:
		"$0 containers usage\n\nGet current live resource usage and maximum limits for your account. Usage includes active and assigned instances.",
	...parameters,
	loader: () => import("./usage.handler.js"),
});

export default command;
