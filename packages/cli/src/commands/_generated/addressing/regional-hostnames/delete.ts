/**
 * delete command
 * @generated from apis/overlays/addressing.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "hostname",
			brief:
				"DNS hostname to be regionalized, must be a subdomain of the zone. Wildcards are supported for one level, e.g \`*.example.com\`",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <hostname>",
	describe: "Delete Regional Hostname",
	usage:
		"$0 addressing regional-hostnames delete <hostname>\n\nDelete the region configuration for a specific Regional Hostname.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
