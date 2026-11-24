/**
 * bulk-apply command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"include-shadow-metadata": {
			kind: "boolean",
			brief:
				"Whether to include shadow metadata in the `meta` field of each record in the response. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
			optional: true,
		},
		deletes: {
			kind: "parsed",
			brief:
				'The deletes field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		patches: {
			kind: "parsed",
			brief:
				'The patches field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id": string} & (({"comment"?: string, "name"?: string, "proxied"?: boolean, "settings"?: {...}, "tags"?: [string], ...more} & {"content"?: string, "private_routing"?: boolean, "type"?: "A"}) | ...more))]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		posts: {
			kind: "parsed",
			brief:
				'The posts field. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"comment"?: string, "name"?: string, "proxied"?: boolean, "settings"?: {...}, "tags"?: [string], ...more} & {"content"?: string, "private_routing"?: boolean, "type"?: "A"}) | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		puts: {
			kind: "parsed",
			brief:
				'The puts field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id": string} & (({"comment"?: string, "name"?: string, "proxied"?: boolean, "settings"?: {...}, "tags"?: [string], ...more} & {"content"?: string, "private_routing"?: boolean, "type"?: "A"}) | ...more))]. ? marks optional keys.',
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
	command: "bulk-apply",
	describe: "Batch DNS Records",
	usage:
		'$0 dns records bulk-apply\n\nSend a Batch of DNS Record API calls to be executed together. Notes: - Although Cloudflare will execute the batched operations in a single database transaction, Cloudflare\'s distributed KV store must treat each record change as a single key-value pair. This means that the propagation of changes is not atomic. See [the documentation](https://developers.cloudflare.com/dns/manage-dns-records/how-to/batch-record-changes/ "Batch DNS records") for more information. - The operations you specify within the /batch request body are always executed in the following order: - Deletes - Patches - Puts - Posts',
	...parameters,
	loader: () => import("./bulk-apply.handler.js"),
});

export default command;
