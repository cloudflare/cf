/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"finding-id": {
			kind: "parsed",
			brief:
				"The `id` of a finding, as returned in each item of the List posture findings response.\nIt is a base64-encoded identifier.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "instance-id",
			brief: "A uuid ID identifying this Finding instance.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <instance-id>",
	describe: "Get a finding instance using an instance ID",
	usage:
		"$0 zero-trust casb findings instances get <instance-id>\n\nGets a security Finding instance by id.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
