/**
 * edit command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"region-key": {
			kind: "parsed",
			brief: "Identifying key for the region",
			optional: true,
			parse: String,
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
			placeholder: "hostname",
			brief:
				"DNS hostname to be regionalized, must be a subdomain of the zone. Wildcards are supported for one level, e.g \`*.example.com\`",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <hostname>",
	describe: "Update Regional Hostname",
	usage:
		"$0 addressing regional-hostnames edit <hostname>\n\nUpdate the configuration for a specific Regional Hostname. Only the region_key of a hostname is mutable.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
