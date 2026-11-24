/**
 * get command
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
	command: "get <hostname>",
	describe: "Fetch Regional Hostname",
	usage:
		"$0 addressing regional-hostnames get <hostname>\n\nFetch the configuration for a specific Regional Hostname, within a zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
