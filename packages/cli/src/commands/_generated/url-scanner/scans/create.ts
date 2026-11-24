import operation from "../../_operations/url-scanner/scans/create.js";
/**
 * create command
 * @generated from apis/overlays/url-scanner.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create URL Scan",
	usage:
		"$0 url-scanner scans create\n\nSubmit a URL to scan. Check limits at https://developers.cloudflare.com/security-center/investigate/scan-limits/.",
	flags: {
		"agent-readiness": {
			kind: "boolean",
			brief: "Enable agent readiness checks.",
			optional: true,
		},
		country: {
			kind: "parsed",
			brief: "Country to geo egress from",
			optional: true,
			choices: [
				"AE",
				"AL",
				"AM",
				"AO",
				"AR",
				"AT",
				"AU",
				"AZ",
				"BB",
				"BD",
				"BE",
				"BF",
				"BG",
				"BH",
				"BN",
				"BO",
				"BR",
				"BT",
				"BW",
				"BY",
				"CA",
				"CH",
				"CI",
				"CL",
				"CM",
				"CO",
				"CR",
				"CY",
				"CZ",
				"DE",
				"DJ",
				"DK",
				"DO",
				"DZ",
				"EC",
				"EE",
				"EG",
				"ES",
				"ET",
				"FI",
				"FJ",
				"FR",
				"GB",
				"GE",
				"GH",
				"GR",
				"GT",
				"GY",
				"HK",
				"HN",
				"HR",
				"HU",
				"ID",
				"IE",
				"IL",
				"IN",
				"IQ",
				"IS",
				"IT",
				"JM",
				"JO",
				"JP",
				"KE",
				"KG",
				"KH",
				"KR",
				"KW",
				"KZ",
				"LA",
				"LB",
				"LK",
				"LT",
				"LU",
				"LV",
				"MD",
				"MG",
				"MK",
				"MN",
				"MO",
				"MT",
				"MU",
				"MV",
				"MX",
				"MY",
				"MZ",
				"NA",
				"NC",
				"NG",
				"NL",
				"NO",
				"NP",
				"NZ",
				"OM",
				"PA",
				"PE",
				"PF",
				"PH",
				"PK",
				"PL",
				"PR",
				"PS",
				"PT",
				"PY",
				"QA",
				"RE",
				"RO",
				"RS",
				"RU",
				"RW",
				"SA",
				"SE",
				"SG",
				"SI",
				"SK",
				"SN",
				"SR",
				"TH",
				"TN",
				"TR",
				"TT",
				"TW",
				"TZ",
				"UA",
				"UG",
				"US",
				"VN",
				"ZA",
				"ZM",
				"ZW",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "country", "text"),
		},
		"custom-headers": {
			kind: "parsed",
			brief:
				'Set custom headers. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		customagent: {
			kind: "parsed",
			brief: "The customagent field",
			optional: true,
			parse: String,
		},
		referer: {
			kind: "parsed",
			brief: "The referer field",
			optional: true,
			parse: String,
		},
		"screenshots-resolutions": {
			kind: "parsed",
			brief: "Take multiple screenshots targeting different device types.",
			variadic: true,
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief: "The url field",
			optional: true,
			parse: String,
		},
		visibility: {
			kind: "parsed",
			brief:
				"The option `Public` means it will be included in listings like recent scans and search results. `Unlisted` means it will not be included in the aforementioned listings, users will need to have the scan's ID to access it. A a scan will be automatically marked as unlisted if it fails, if it contains potential PII or other sensitive material.",
			default: "Public",
			choices: ["Public", "Unlisted"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "visibility", "text"),
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "url-scanner scans create",
				classification: {
					safeFlags: ["agent-readiness", "country", "visibility", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["url"] === undefined) {
						argv["url"] = await promptForRequiredField("url", "The url field");
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf url-scanner scans create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/urlscanner/v2/scan`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											agentReadiness: argv["agent-readiness"],
											country: argv["country"],
											customHeaders: parseJsonMap(
												argv["custom-headers"],
												"custom-headers"
											),
											customagent: resolveFileToken(
												argv["customagent"] as string | undefined,
												"customagent",
												"text"
											),
											referer: resolveFileToken(
												argv["referer"] as string | undefined,
												"referer",
												"text"
											),
											screenshotsResolutions: argv["screenshots-resolutions"],
											url: resolveFileToken(
												argv["url"] as string | undefined,
												"url",
												"text"
											),
											visibility: argv["visibility"],
										},
										[["customHeaders"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						agentReadiness: argv["agent-readiness"],
						country: argv["country"],
						customHeaders: parseJsonMap(
							argv["custom-headers"],
							"custom-headers"
						),
						customagent: resolveFileToken(
							argv["customagent"] as string | undefined,
							"customagent",
							"text"
						),
						referer: resolveFileToken(
							argv["referer"] as string | undefined,
							"referer",
							"text"
						),
						screenshotsResolutions: argv["screenshots-resolutions"],
						url: resolveFileToken(
							argv["url"] as string | undefined,
							"url",
							"text"
						),
						visibility: argv["visibility"],
					},
					[["customHeaders"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
