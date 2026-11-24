import operation from "../../_operations/abuse-reports/mitigations/review.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./review.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "abuse-reports mitigations review",
			classification: {
				safeFlags: [
					"data-jurisdiction-consent",
					"data-perjury-attestation",
					"type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
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
									explanation: resolveFileToken(
										argv["explanation"] as string | undefined,
										"explanation",
										"text"
									),
									type: argv["type"],
								}),
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						report_id: argv["report-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
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
				explanation: resolveFileToken(
					argv["explanation"] as string | undefined,
					"explanation",
					"text"
				),
				type: argv["type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					report_id: argv["report-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
