import operation from "../../_operations/radar/ct/summary.js";
/**
 * summary command
 * @generated from apis/overlays/radar.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "summary <dimension>",
	describe: "Get certificate distribution by dimension",
	usage:
		"$0 radar ct summary <dimension>\n\nRetrieves an aggregated summary of certificates grouped by the specified dimension.",
	flags: {
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
		"limit-per-group": {
			kind: "parsed",
			brief:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
			optional: true,
			parse: Number,
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
		normalization: {
			kind: "enum",
			brief:
				"Normalization method applied to the results. Refer to [Normalization methods](https://developers.cloudflare.com/radar/concepts/normalization/).",
			values: ["RAW_VALUES", "PERCENTAGE"],
			optional: true,
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
	operands: [
		{
			placeholder: "dimension",
			brief:
				"Specifies the certificate attribute by which to group the results.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar ct summary",
				classification: {
					safeFlags: ["normalization", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name: argv["name"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					limitPerGroup: argv["limit-per-group"],
					ca: argv["ca"],
					caOwner: argv["ca-owner"],
					duration: argv["duration"],
					entryType: argv["entry-type"],
					expirationStatus: argv["expiration-status"],
					hasIps: argv["has-ips"],
					hasWildcards: argv["has-wildcards"],
					log: argv["log"],
					logApi: argv["log-api"],
					logOperator: argv["log-operator"],
					publicKeyAlgorithm: argv["public-key-algorithm"],
					signatureAlgorithm: argv["signature-algorithm"],
					tld: argv["tld"],
					validationLevel: argv["validation-level"],
					uniqueEntries: argv["unique-entries"],
					normalization: argv["normalization"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar ct summary",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/ct/summary/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						dimension: argv["dimension"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
