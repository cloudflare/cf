/**
 * delete command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tenant-id": {
			kind: "parsed",
			brief: "Tenant identifier tag.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "custom-ns-id",
			brief: "The FQDN of the name server.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <custom-ns-id>",
	describe: "Delete Tenant Custom Nameserver",
	usage:
		"$0 tenant-custom-nameservers delete <custom-ns-id>\n\nDeletes a tenant's custom nameserver.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
