/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief:
				"An optional description field which may be used to describe the types of IPs or zones on the map.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether the Address Map is enabled or not. Cloudflare's DNS will not respond with IP addresses on an Address Map until the map is enabled.",
			default: false,
		},
		ips: {
			kind: "parsed",
			brief: "The ips field",
			variadic: true,
			optional: true,
			parse: String,
		},
		memberships: {
			kind: "parsed",
			brief:
				'Zones and Accounts which will be assigned IPs on this Address Map. A zone membership will take priority over an account membership. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"identifier"?: string, "kind"?: "zone" | "account"}]. ? marks optional keys.',
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
	describe: "Create Address Map",
	usage:
		"$0 addressing address-maps create\n\nCreate a new address map under the account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
