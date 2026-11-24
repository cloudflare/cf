/**
 * update command
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
		{ placeholder: "dns-record-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <dns-record-id>",
	describe: "Overwrite DNS Record",
	usage:
		"$0 dns records update <dns-record-id>\n\nOverwrite an existing DNS record. Notes: - A/AAAA records cannot exist on the same name as CNAME records. - NS records cannot exist on the same name as any other record type. - Domain names are always represented in Punycode, even if Unicode characters were used when creating the record.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
