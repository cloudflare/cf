/**
 * update command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		hostnames: {
			kind: "parsed",
			brief: "Hostnames matched by the application.",
			variadic: true,
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
				"Update the network matchers for the application. The service preserves omitted matcher lists; send an empty array to clear a list. The resulting application must contain at least one hostname or IP subnet. Support domains and port/protocol pairs do not satisfy this requirement. A NUL character (U+0000) in any string value returns `400`. ",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "id", brief: "Application ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <id>",
	describe: "Update application",
	usage:
		"$0 accounts applications update <id>\n\nReplace the supplied network matchers for a custom application and create a new version. Omitted matcher lists remain unchanged; send an empty list to clear a matcher type.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
