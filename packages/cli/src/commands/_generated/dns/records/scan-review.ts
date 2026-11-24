/**
 * scan-review command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		accepts: {
			kind: "parsed",
			brief:
				'The accepts field. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"comment"?: string, "name"?: string, "proxied"?: boolean, "settings"?: {...}, "tags"?: [string], ...more} & {"content"?: string, "private_routing"?: boolean, "type"?: "A"}) | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		rejects: {
			kind: "parsed",
			brief:
				'The rejects field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
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
	command: "scan-review",
	describe: "Review Scanned DNS Records",
	usage:
		"$0 dns records scan-review\n\nAccept or reject DNS records found by the DNS records scan. Accepted records will be permanently added to the zone, while rejected records will be permanently deleted.",
	...parameters,
	loader: () => import("./scan-review.handler.js"),
});

export default command;
