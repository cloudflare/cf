/**
 * timeseries command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"agg-interval": {
			kind: "enum",
			brief:
				"Aggregation interval of the results (e.g., in 15 minutes or 1 hour intervals). Refer to [Aggregation intervals](https://developers.cloudflare.com/radar/concepts/aggregation-intervals/). When omitted, the interval is auto-selected from the requested date range; finer intervals are only available for shorter ranges. If the requested interval is too granular for the date range, the request is rejected.",
			values: ["15m", "1h", "1d", "1w"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-range": {
			kind: "parsed",
			brief:
				"Filters results by relative date range ending at the current time, with each value producing a separate series. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`). Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `7dcontrol` covers days -14 to -7, `10dcontrol` covers days -24 to -14). For example, pass `7d` and `7dcontrol` to compare this week with the previous week. All series must resolve to the same duration as the main series; relative ranges (including `control`) satisfy this automatically. Use this parameter or set specific start and end dates (`dateStart` and `dateEnd` parameters).",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-start": {
			kind: "parsed",
			brief:
				"Start of the date range. Alternative to `dateRange`; provide together with `dateEnd`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-end": {
			kind: "parsed",
			brief:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		ca: {
			kind: "parsed",
			brief: "Filters results by certificate authority.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ca-owner": {
			kind: "parsed",
			brief: "Filters results by certificate authority owner.",
			variadic: true,
			optional: true,
			parse: String,
		},
		duration: {
			kind: "parsed",
			brief: "Filters results by certificate duration.",
			variadic: true,
			optional: true,
			choices: [
				"LTE_3D",
				"GT_3D_LTE_7D",
				"GT_7D_LTE_10D",
				"GT_10D_LTE_47D",
				"GT_47D_LTE_100D",
				"GT_100D_LTE_200D",
				"GT_200D",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"entry-type": {
			kind: "parsed",
			brief:
				"Filters results by entry type (certificate vs. pre-certificate). Incompatible with the `tld` filter/dimension.",
			variadic: true,
			optional: true,
			choices: ["PRECERTIFICATE", "CERTIFICATE"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"expiration-status": {
			kind: "parsed",
			brief: "Filters results by expiration status (expired vs. valid).",
			variadic: true,
			optional: true,
			choices: ["EXPIRED", "VALID"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"has-ips": {
			kind: "parsed",
			brief:
				"Filters results based on whether the certificates are bound to specific IP addresses.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"has-wildcards": {
			kind: "parsed",
			brief:
				"Filters results based on whether the certificates contain wildcard domains.",
			variadic: true,
			optional: true,
			parse: String,
		},
		log: {
			kind: "parsed",
			brief:
				"Filters results by certificate log. Incompatible with the `tld` filter/dimension.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"log-api": {
			kind: "parsed",
			brief:
				"Filters results by certificate log API (RFC6962 vs. static). Incompatible with the `tld` filter/dimension.",
			variadic: true,
			optional: true,
			choices: ["RFC6962", "STATIC"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"log-operator": {
			kind: "parsed",
			brief:
				"Filters results by certificate log operator. Incompatible with the `tld` filter/dimension.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-key-algorithm": {
			kind: "parsed",
			brief: "Filters results by public key algorithm.",
			variadic: true,
			optional: true,
			choices: ["DSA", "ECDSA", "RSA"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"signature-algorithm": {
			kind: "parsed",
			brief: "Filters results by signature algorithm.",
			variadic: true,
			optional: true,
			choices: [
				"DSA_SHA_1",
				"DSA_SHA_256",
				"ECDSA_SHA_1",
				"ECDSA_SHA_256",
				"ECDSA_SHA_384",
				"ECDSA_SHA_512",
				"PSS_SHA_256",
				"PSS_SHA_384",
				"PSS_SHA_512",
				"RSA_MD2",
				"RSA_MD5",
				"RSA_SHA_1",
				"RSA_SHA_256",
				"RSA_SHA_384",
				"RSA_SHA_512",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		tld: {
			kind: "parsed",
			brief:
				"Filters results by top-level domain. Incompatible with the `log`, `logApi`, `logOperator`, and `entryType` filters/dimensions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"validation-level": {
			kind: "parsed",
			brief: "Filters results by validation level.",
			variadic: true,
			optional: true,
			choices: ["DOMAIN", "ORGANIZATION", "EXTENDED"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"unique-entries": {
			kind: "parsed",
			brief:
				"Specifies whether to filter out duplicate certificates and pre-certificates. Set to true for unique entries only.",
			variadic: true,
			optional: true,
			choices: ["true", "false"],
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
	command: "timeseries",
	describe: "Get certificates time series",
	usage: "$0 radar ct timeseries\n\nRetrieves certificate volume over time.",
	...parameters,
	loader: () => import("./timeseries.handler.js"),
});

export default command;
