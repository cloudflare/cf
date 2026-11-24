/**
 * global command
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
		"limit-per-group": {
			kind: "parsed",
			brief: "Limits the number of objects per search category.",
			optional: true,
			parse: Number,
		},
		query: {
			kind: "parsed",
			brief: "String used to perform the search operation.",
			parse: String,
		},
		include: {
			kind: "parsed",
			brief: "Search types included in results.",
			variadic: true,
			optional: true,
			choices: [
				"ADM1S",
				"ASNS",
				"BOTS",
				"BOT_OPERATORS",
				"CERTIFICATE_AUTHORITIES",
				"CERTIFICATE_LOGS",
				"ORIGINS",
				"ORIGIN_REGIONS",
				"INDUSTRIES",
				"LOCATIONS",
				"NOTEBOOKS",
				"TLDS",
				"VERTICALS",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		exclude: {
			kind: "parsed",
			brief: "Search types excluded from results.",
			variadic: true,
			optional: true,
			choices: [
				"ADM1S",
				"ASNS",
				"BOTS",
				"BOT_OPERATORS",
				"CERTIFICATE_AUTHORITIES",
				"CERTIFICATE_LOGS",
				"ORIGINS",
				"ORIGIN_REGIONS",
				"INDUSTRIES",
				"LOCATIONS",
				"NOTEBOOKS",
				"TLDS",
				"VERTICALS",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
	command: "global",
	describe: "Search for locations, ASes, reports, and more",
	usage:
		"$0 radar search global\n\nSearches for locations, autonomous systems, reports, bots, bot operators, certificate logs, certificate authorities, industries and verticals. Location names can be localized by sending an `Accept-Language` HTTP header with a BCP 47 language tag (e.g., `Accept-Language: pt-PT`). The full quality-value chain is supported (e.g., `pt-PT,pt;q=0.9,en;q=0.8`). ASN, ADM1 and ADM2 results include an `entity` with details about the matched entity.",
	...parameters,
	loader: () => import("./global.handler.js"),
});

export default command;
