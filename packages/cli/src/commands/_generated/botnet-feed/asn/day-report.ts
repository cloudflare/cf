/**
 * day-report command
 * @generated from apis/overlays/botnet-feed.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		date: { kind: "parsed", brief: "Date", optional: true, parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "asn-id", brief: "Asn ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "day-report <asn-id>",
	describe: "Get daily report",
	usage:
		"$0 botnet-feed asn day-report <asn-id>\n\nGets all the data the botnet tracking database has for a given ASN registered to user account for given date. If no date is given, it will return results for the previous day.",
	...parameters,
	loader: () => import("./day-report.handler.js"),
});

export default command;
