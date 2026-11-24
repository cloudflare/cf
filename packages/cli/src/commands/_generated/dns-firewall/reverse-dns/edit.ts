/**
 * edit command
 * @generated from apis/overlays/dns-firewall.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		ptr: {
			kind: "parsed",
			brief:
				'Map of cluster IP addresses to PTR record contents. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
		{ placeholder: "dns-firewall-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <dns-firewall-id>",
	describe: "Update DNS Firewall Cluster Reverse DNS",
	usage:
		"$0 dns-firewall reverse-dns edit <dns-firewall-id>\n\nUpdate reverse DNS configuration (PTR records) for a DNS Firewall cluster",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
