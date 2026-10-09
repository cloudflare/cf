import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * review command
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 abuse-reports mitigations review <report-id>\n\nRequest a review of mitigations applied because of an abuse report, or submit a report-level appeal. - To request a review of specific mitigations, send `appeals` with the mitigation IDs and reasons. Repeating a request for a mitigation with an unresolved appeal is idempotent and returns that mitigation in the in-review state. - To submit a report-level appeal, send `type` and, for a `counter_notice`, the counter-notice details in `data`. Report-level appeals are currently available only for DMCA (copyright) reports."
		)
		.positional("report-id", {
			type: "string",
			description: "Abuse Report ID",
			demandOption: true,
		})
		.option("appeals", {
			type: "string",
			description:
				"List of mitigations to appeal. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("data-city", { type: "string", description: "The data.city field" })
		.option("data-company", {
			type: "string",
			description: "The data.company field",
		})
		.option("data-counter-notice-response", {
			type: "string",
			description: "The data.counter_notice_response field",
		})
		.option("data-country", {
			type: "string",
			description: "The data.country field",
		})
		.option("data-email", {
			type: "string",
			description: "The data.email field",
		})
		.option("data-full-name", {
			type: "string",
			description: "The data.full_name field",
		})
		.option("data-jurisdiction-consent", {
			type: "boolean",
			description: "The data.jurisdiction_consent field",
		})
		.option("data-perjury-attestation", {
			type: "boolean",
			description: "The data.perjury_attestation field",
		})
		.option("data-phone-number", {
			type: "string",
			description: "The data.phone_number field",
		})
		.option("data-signature", {
			type: "string",
			description: "The data.signature field",
		})
		.option("data-state", {
			type: "string",
			description: "The data.state field",
		})
		.option("data-street-address", {
			type: "string",
			description: "The data.street_address field",
		})
		.option("data-urls", {
			type: "string",
			array: true,
			description: "The data.urls field",
		})
		.option("data-zip-code", {
			type: "string",
			description: "The data.zip_code field",
		})
		.option("type", {
			type: "string",
			description: "The type of appeal being submitted.",
			choices: ["counter_notice", "content_removed"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				'Submit an appeal for a report. Provide either a list of mitigations to appeal, or an appeal type with its supporting details, but not both. When type is "counter_notice", the counter-notice details are required.',
		})
		.check((argv) => {
			const groupSet = [
				"data-city",
				"data-company",
				"data-counter-notice-response",
				"data-country",
				"data-email",
				"data-full-name",
				"data-jurisdiction-consent",
				"data-perjury-attestation",
				"data-phone-number",
				"data-signature",
				"data-state",
				"data-street-address",
				"data-urls",
				"data-zip-code",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"data-city",
					"data-country",
					"data-email",
					"data-full-name",
					"data-jurisdiction-consent",
					"data-perjury-attestation",
					"data-phone-number",
					"data-signature",
					"data-state",
					"data-street-address",
					"data-urls",
					"data-zip-code",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --data-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"RequestReview">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "review <report-id>",
	describe: "Request review on mitigations",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "abuse-reports mitigations review",
				classification: {
					safeFlags: [
						"data-jurisdiction-consent",
						"data-perjury-attestation",
						"type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports mitigations review",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/${argv["report-id"] == null ? "<report-id>" : encodeURIComponent(String(argv["report-id"]))}/mitigations/appeal`,
						pathParams: { "report-id": String(argv["report-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										appeals: parseObjectArray(argv["appeals"], "appeals"),
										data: {
											city: resolveFileToken(
												argv["data-city"] as string | undefined,
												"data-city",
												"text"
											),
											company: resolveFileToken(
												argv["data-company"] as string | undefined,
												"data-company",
												"text"
											),
											counter_notice_response: resolveFileToken(
												argv["data-counter-notice-response"] as
													| string
													| undefined,
												"data-counter-notice-response",
												"text"
											),
											country: resolveFileToken(
												argv["data-country"] as string | undefined,
												"data-country",
												"text"
											),
											email: resolveFileToken(
												argv["data-email"] as string | undefined,
												"data-email",
												"text"
											),
											full_name: resolveFileToken(
												argv["data-full-name"] as string | undefined,
												"data-full-name",
												"text"
											),
											jurisdiction_consent: argv["data-jurisdiction-consent"],
											perjury_attestation: argv["data-perjury-attestation"],
											phone_number: resolveFileToken(
												argv["data-phone-number"] as string | undefined,
												"data-phone-number",
												"text"
											),
											signature: resolveFileToken(
												argv["data-signature"] as string | undefined,
												"data-signature",
												"text"
											),
											state: resolveFileToken(
												argv["data-state"] as string | undefined,
												"data-state",
												"text"
											),
											street_address: resolveFileToken(
												argv["data-street-address"] as string | undefined,
												"data-street-address",
												"text"
											),
											urls: argv["data-urls"],
											zip_code: resolveFileToken(
												argv["data-zip-code"] as string | undefined,
												"data-zip-code",
												"text"
											),
										},
										type: argv["type"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.abuseReports.mitigations.review({
							body: bodyData,
							account_id: accountId,
							report_id: argv["report-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					appeals: parseObjectArray(argv["appeals"], "appeals"),
					data: {
						city: resolveFileToken(
							argv["data-city"] as string | undefined,
							"data-city",
							"text"
						),
						company: resolveFileToken(
							argv["data-company"] as string | undefined,
							"data-company",
							"text"
						),
						counter_notice_response: resolveFileToken(
							argv["data-counter-notice-response"] as string | undefined,
							"data-counter-notice-response",
							"text"
						),
						country: resolveFileToken(
							argv["data-country"] as string | undefined,
							"data-country",
							"text"
						),
						email: resolveFileToken(
							argv["data-email"] as string | undefined,
							"data-email",
							"text"
						),
						full_name: resolveFileToken(
							argv["data-full-name"] as string | undefined,
							"data-full-name",
							"text"
						),
						jurisdiction_consent: argv["data-jurisdiction-consent"],
						perjury_attestation: argv["data-perjury-attestation"],
						phone_number: resolveFileToken(
							argv["data-phone-number"] as string | undefined,
							"data-phone-number",
							"text"
						),
						signature: resolveFileToken(
							argv["data-signature"] as string | undefined,
							"data-signature",
							"text"
						),
						state: resolveFileToken(
							argv["data-state"] as string | undefined,
							"data-state",
							"text"
						),
						street_address: resolveFileToken(
							argv["data-street-address"] as string | undefined,
							"data-street-address",
							"text"
						),
						urls: argv["data-urls"],
						zip_code: resolveFileToken(
							argv["data-zip-code"] as string | undefined,
							"data-zip-code",
							"text"
						),
					},
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.abuseReports.mitigations.review({
						body: bodyData,
						account_id: accountId,
						report_id: argv["report-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
