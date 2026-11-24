/**
 * status command
 * @generated from apis/overlays/network-interconnects.ts
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
	operands: [
		{
			placeholder: "icon",
			brief: "Interconnect name to retrieve information about",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "status <icon>",
	describe: "Get the current status of an interconnect object",
	usage:
		"$0 network-interconnects interconnects status <icon>\n\nGets the current operational status of a network interconnect, including link state and traffic metrics.",
	...parameters,
	loader: () => import("./status.handler.js"),
});

export default command;
