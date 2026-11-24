/**
 * create command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		advanced: {
			kind: "boolean",
			brief:
				"Whether to allocate the nameservers from distinct Advanced anycast groups.",
			default: false,
		},
		"ip-set": {
			kind: "parsed",
			brief:
				"Selects the account-specific IP set that supplies the nameserver addresses. Nameserver sets with the same `ip_set` and `advanced` value may reuse addresses; otherwise, they use disjoint address groups.",
			default: "1",
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"Customer-defined name, unique within the account by exact string equality (case-sensitive, with no Unicode normalization). Must be valid UTF-8 and at most 255 UTF-8 bytes, not 255 characters. Only graphical Unicode characters are allowed; leading or trailing whitespace is rejected. The name can be changed without changing the set's nameservers or addresses.",
			optional: true,
			parse: String,
		},
		nameservers: {
			kind: "parsed",
			brief:
				'Lists each nameserver and the number of addresses to allocate to it. Requires a unique name for each entry in the set. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "ip_count"?: number}]. ? marks optional keys.',
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
	describe: "Create Custom Nameserver Set",
	usage:
		"$0 dns settings account nameserver-sets create\n\nCreates a named Custom Nameserver Set. Only the customer-defined name can be changed later. To change nameservers or addresses, create a new set, move any zone assignments, and delete the old set. For details, refer to [Nameserver sets](https://developers.cloudflare.com/dns/nameservers/custom-nameservers/nameserver-sets/).",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
