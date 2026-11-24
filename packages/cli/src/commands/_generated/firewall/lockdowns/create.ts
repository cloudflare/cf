/**
 * create command
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
		description: {
			kind: "parsed",
			brief:
				"An informative summary of the rule. This value is sanitized and any tags will be removed.",
			optional: true,
			parse: String,
		},
		paused: {
			kind: "boolean",
			brief: "When true, indicates that the rule is currently paused.",
			optional: true,
		},
		priority: {
			kind: "parsed",
			brief:
				"The priority of the rule to control the processing order. A lower number indicates higher priority. If not provided, any rules with a configured priority will be processed before rules without a priority.",
			optional: true,
			parse: Number,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a Zone Lockdown rule",
	usage: "$0 firewall lockdowns create\n\nCreates a new Zone Lockdown rule.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
