/**
 * create command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"category-id": {
			kind: "parsed",
			brief: "Numeric identifier for an application category.",
			optional: true,
			parse: Number,
		},
		hostnames: {
			kind: "parsed",
			brief: "Hostnames matched by the application.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"human-id": {
			kind: "parsed",
			brief: "Human-readable identifier for the application.",
			optional: true,
			parse: String,
		},
		"ip-subnets": {
			kind: "parsed",
			brief:
				"IP subnets for this application. Custom application create and update requests accept IPv4 prefix lengths /8 through /32 and IPv6 prefix lengths /32 through /128.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Application name.",
			optional: true,
			parse: String,
		},
		"port-protocols": {
			kind: "parsed",
			brief:
				"Ports matched by the application, in `protocol/port` or inclusive `protocol/start-end` format (for example, `tcp/443` or `udp/10000-20000`). TCP and UDP ports must be between 0 and 65535.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"support-domains": {
			kind: "parsed",
			brief: "Support domains matched by the application.",
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
			brief:
				"Defines a custom application. At least one hostname or IP subnet is required. Support domains and port/protocol pairs do not satisfy this requirement. A NUL character (U+0000) in any string value returns `400`. ",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create application",
	usage:
		"$0 accounts applications create\n\nCreate a custom application for an account from a name, category, and optional network matchers.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
