/**
 * get command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
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
			placeholder: "tenant-id",
			brief: "Tenant identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <tenant-id>",
	describe: "List Tenant Custom Nameservers",
	usage:
		"$0 tenant-custom-nameservers get <tenant-id>\n\nLists a tenant's custom nameservers.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
