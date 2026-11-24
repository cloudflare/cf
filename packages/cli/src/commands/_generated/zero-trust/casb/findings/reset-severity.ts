/**
 * reset-severity command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "finding-id",
			brief:
				"The \`id\` of a finding, as returned in each item of the List posture findings response. It is a base64-encoded identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "reset-severity <finding-id>",
	describe: "Reset severity for a finding back to the default",
	usage:
		"$0 zero-trust casb findings reset-severity <finding-id>\n\nIf a Finding's severity has been changed, reset it back to default value. Does nothing if no override exists.",
	...parameters,
	loader: () => import("./reset-severity.handler.js"),
});

export default command;
