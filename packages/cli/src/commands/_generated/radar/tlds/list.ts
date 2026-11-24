/**
 * list command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Skips the specified number of objects before fetching the results.",
			optional: true,
			parse: Number,
		},
		"tld-manager": {
			kind: "parsed",
			brief: "Filters results by TLD manager.",
			optional: true,
			parse: String,
		},
		"tld-type": {
			kind: "enum",
			brief:
				"Filters results by TLD type. GENERIC_RESTRICTED and SPONSORED are deprecated and return no results, as IANA consolidated them into GENERIC. INFRASTRUCTURE is deprecated, as IANA reclassified .arpa as SPECIAL_USE.",
			values: [
				"GENERIC",
				"COUNTRY_CODE",
				"SPECIAL_USE",
				"GENERIC_RESTRICTED",
				"INFRASTRUCTURE",
				"SPONSORED",
			],
			optional: true,
		},
		tld: {
			kind: "parsed",
			brief:
				"Filters results by top-level domain. Specify a comma-separated list of TLDs.",
			optional: true,
			parse: String,
		},
		format: {
			kind: "enum",
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List TLDs",
	usage: "$0 radar tlds list\n\nRetrieves a list of TLDs.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
