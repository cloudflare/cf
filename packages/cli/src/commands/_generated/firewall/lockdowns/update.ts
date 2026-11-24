/**
 * update command
 * @generated from apis/overlays/firewall.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		configurations: {
			kind: "parsed",
			brief:
				'A list of IP addresses or CIDR ranges that will be allowed to access the URLs specified in the Zone Lockdown rule. You can include any number of `ip` or `ip_range` configurations. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"target"?: "ip", "value"?: string} | {"target"?: "ip_range", "value"?: string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		urls: {
			kind: "parsed",
			brief:
				"The URLs to include in the current WAF override. You can use wildcards. Each entered URL will be escaped before use, which means you can only use simple wildcard patterns.",
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
			placeholder: "lock-downs-id",
			brief: "The unique identifier of the Zone Lockdown rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <lock-downs-id>",
	describe: "Update a Zone Lockdown rule",
	usage:
		"$0 firewall lockdowns update <lock-downs-id>\n\nUpdates an existing Zone Lockdown rule.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
