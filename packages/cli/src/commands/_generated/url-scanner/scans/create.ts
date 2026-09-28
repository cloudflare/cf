import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/url-scanner.ts
 */
import type { Argv, CommandModule } from "yargs";

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
				"AF",
				"AL",
				"DZ",
				"AD",
				"AO",
				"AG",
				"AR",
				"AM",
				"AU",
				"AT",
				"AZ",
				"BH",
				"BD",
				"BB",
				"BY",
				"BE",
				"BZ",
				"BJ",
				"BM",
				"BT",
				"BO",
				"BA",
				"BW",
				"BR",
				"BN",
				"BG",
				"BF",
				"BI",
				"KH",
				"CM",
				"CA",
				"CV",
				"KY",
				"CF",
				"TD",
				"CL",
				"CN",
				"CO",
				"KM",
				"CG",
				"CR",
				"CI",
				"HR",
				"CU",
				"CY",
				"CZ",
				"CD",
				"DK",
				"DJ",
				"DM",
				"DO",
				"EC",
				"EG",
				"SV",
				"GQ",
				"ER",
				"EE",
				"SZ",
				"ET",
				"FJ",
				"FI",
				"FR",
				"GA",
				"GE",
				"DE",
				"GH",
				"GR",
				"GL",
				"GD",
				"GT",
				"GN",
				"GW",
				"GY",
				"HT",
				"HN",
				"HU",
				"IS",
				"IN",
				"ID",
				"IR",
				"IQ",
				"IE",
				"IL",
				"IT",
				"JM",
				"JP",
				"JO",
				"KZ",
				"KE",
				"KI",
				"KW",
				"KG",
				"LA",
				"LV",
				"LB",
				"LS",
				"LR",
				"LY",
				"LI",
				"LT",
				"LU",
				"MO",
				"MG",
				"MW",
				"MY",
				"MV",
				"ML",
				"MR",
				"MU",
				"MX",
				"FM",
				"MD",
				"MC",
				"MN",
				"MS",
				"MA",
				"MZ",
				"MM",
				"NA",
				"NR",
				"NP",
				"NL",
				"NZ",
				"NI",
				"NE",
				"NG",
				"KP",
				"MK",
				"NO",
				"OM",
				"PK",
				"PS",
				"PA",
				"PG",
				"PY",
				"PE",
				"PH",
				"PL",
				"PT",
				"QA",
				"RO",
				"RU",
				"RW",
				"SH",
				"KN",
				"LC",
				"VC",
				"WS",
				"SM",
				"ST",
				"SA",
				"SN",
				"RS",
				"SC",
				"SL",
				"SK",
				"SI",
				"SB",
				"SO",
				"ZA",
				"KR",
				"SS",
				"ES",
				"LK",
				"SD",
				"SR",
				"SE",
				"CH",
				"SY",
				"TW",
				"TJ",
				"TZ",
				"TH",
				"BS",
				"GM",
				"TL",
				"TG",
				"TO",
				"TT",
				"TN",
				"TR",
				"TM",
				"UG",
				"UA",
				"AE",
				"GB",
				"US",
				"UY",
				"UZ",
				"VU",
				"VE",
				"VN",
				"YE",
				"ZM",
				"ZW",
			],
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

type Request = SdkRequest<"urlscanner-create-scan-v2">;
type Body = Request;

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
								: compactBody({
										agentReadiness: argv["agent-readiness"],
										country: resolveFileToken(
											argv["country"] as string | undefined,
											"country",
											"text"
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
										visibility: resolveFileToken(
											argv["visibility"] as string | undefined,
											"visibility",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.urlScanner.scans.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField("url", "The url field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					agentReadiness: argv["agent-readiness"],
					country: resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
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
					visibility: resolveFileToken(
						argv["visibility"] as string | undefined,
						"visibility",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.urlScanner.scans.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
