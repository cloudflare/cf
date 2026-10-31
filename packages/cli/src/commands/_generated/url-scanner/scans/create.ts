import operation from "../../_operations/url-scanner/scans/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/url-scanner.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 url-scanner scans create\n\nSubmit a URL to scan. Check limits at https://developers.cloudflare.com/security-center/investigate/scan-limits/."
		)
		.option("agent-readiness", {
			type: "boolean",
			description: "Enable agent readiness checks.",
		})
		.option("country", {
			type: "string",
			description: "Country to geo egress from",
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
				"CD",
				"CH",
				"CI",
				"CL",
				"CM",
				"CO",
				"CR",
				"CW",
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
				"GD",
				"GE",
				"GH",
				"GR",
				"GT",
				"GU",
				"GY",
				"HK",
				"HN",
				"HR",
				"HT",
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
				"LR",
				"LT",
				"LU",
				"LV",
				"MA",
				"MD",
				"MG",
				"MK",
				"MM",
				"MN",
				"MO",
				"MT",
				"MU",
				"MV",
				"MW",
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
				"TJ",
				"TN",
				"TR",
				"TT",
				"TW",
				"TZ",
				"UA",
				"UG",
				"US",
				"UZ",
				"VN",
				"ZA",
				"ZM",
				"ZW",
			],
		})
		.coerce("country", (value) => resolveFileToken(value, "country", "text"))
		.option("custom-headers", {
			type: "string",
			description:
				"Set custom headers. Provide as a JSON object or @path/to/file.json.",
		})
		.option("customagent", {
			type: "string",
			description: "The customagent field",
		})
		.option("referer", { type: "string", description: "The referer field" })
		.option("screenshots-resolutions", {
			type: "string",
			array: true,
			description:
				"Take multiple screenshots targeting different device types.",
		})
		.option("url", { type: "string", description: "The url field" })
		.option("visibility", {
			type: "string",
			description:
				"The option `Public` means it will be included in listings like recent scans and search results. `Unlisted` means it will not be included in the aforementioned listings, users will need to have the scan's ID to access it. A a scan will be automatically marked as unlisted if it fails, if it contains potential PII or other sensitive material.",
			choices: ["Public", "Unlisted"],
			default: "Public",
		})
		.coerce("visibility", (value) =>
			resolveFileToken(value, "visibility", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create URL Scan",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "url-scanner scans create",
				classification: {
					safeFlags: ["agent-readiness", "country", "visibility", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField("url", "The url field");
				}

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
};

export default command;
