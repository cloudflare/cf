/**
 * get command
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
	},
	operands: [
		{ placeholder: "dns-record-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <dns-record-id>",
	describe: "DNS Record Details",
	usage:
		"$0 dns records get <dns-record-id>\n\nRetrieves details for a specific DNS record in the zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
