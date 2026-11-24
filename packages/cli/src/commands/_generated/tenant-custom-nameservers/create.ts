/**
 * create command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"ns-name": {
			kind: "parsed",
			brief: "The FQDN of the name server.",
			optional: true,
			parse: String,
		},
		"ns-set": {
			kind: "parsed",
			brief: "The number of the set that this name server belongs to.",
			default: "1",
			parse: Number,
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
	command: "create <tenant-id>",
	describe: "Add Tenant Custom Nameserver",
	usage:
		"$0 tenant-custom-nameservers create <tenant-id>\n\nAdds a custom nameserver for a tenant.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
