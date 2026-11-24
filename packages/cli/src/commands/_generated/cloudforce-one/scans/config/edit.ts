/**
 * edit command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		frequency: {
			kind: "parsed",
			brief: "Defines the number of days between each scan (0 = One-off scan).",
			optional: true,
			parse: Number,
		},
		ips: {
			kind: "parsed",
			brief:
				"Defines a list of IP addresses or CIDR blocks to scan. The maximum number of total IP addresses allowed is 5000.",
			variadic: true,
			optional: true,
			parse: String,
		},
		ports: {
			kind: "parsed",
			brief:
				'Defines a list of ports to scan. Valid values are:"default", "all", or a comma-separated list of ports or range of ports (e.g. ["1-80", "443"]). "default" scans the 100 most commonly open ports.',
			variadic: true,
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
			placeholder: "config-id",
			brief: "Defines the Config ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <config-id>",
	describe: "Update an existing Scan Config",
	usage:
		"$0 cloudforce-one scans config edit <config-id>\n\nUpdates an existing scan configuration in Cloudforce One's network scanning service.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
