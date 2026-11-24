import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "abuse-reports create",
			classification: {
				safeFlags: [
					"act",
					"host-notification",
					"owner-notification",
					"ncmec-notification",
					"reg-who-request-reg-who-good-faith-affirmation",
					"reg-who-request-reg-who-lawful-processing-agreement",
					"reg-who-request-reg-who-request-type",
					"reg-who-request-reg-who-requestor-type",
					"ncsei-subject-representation",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["act"] === undefined) {
					argv["act"] = await promptForRequiredEnumField(
						"act",
						"The act field",
						[
							"abuse_dmca",
							"abuse_trademark",
							"abuse_general",
							"abuse_phishing",
							"abuse_children",
							"abuse_threat",
							"abuse_registrar_whois",
							"abuse_ncsei",
						] as const
					);
				}
				if (argv["email"] === undefined) {
					argv["email"] = await promptForRequiredField(
						"email",
						"A valid email of the abuse reporter. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/)."
					);
				}
				if (argv["email2"] === undefined) {
					argv["email2"] = await promptForRequiredField(
						"email2",
						"Should match the value provided in \`email\`"
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/)."
					);
				}
				if (argv["urls"] === undefined) {
					argv["urls"] = await promptForRequiredField(
						"urls",
						"A list of valid URLs separated by ‘\\n’ (new line character). The list of the URLs should not exceed 250 URLs. All URLs should have the same hostname. Each URL should be unique. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/)."
					);
				}
				if (argv["owner-notification"] === undefined) {
					argv["owner-notification"] = await promptForRequiredEnumField(
						"owner-notification",
						"Notification type based on the abuse type. For delegated reports, the report—including contact information and comments—will be forwarded to the customer in full regardless of this value. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous.",
						["send", "send-anon", "none"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf abuse-reports create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/${argv["report-type"] == null ? "<report-type>" : encodeURIComponent(String(argv["report-type"]))}`,
					pathParams: { "report-type": String(argv["report-type"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									act: argv["act"],
									comments: resolveFileToken(
										argv["comments"] as string | undefined,
										"comments",
										"text"
									),
									company: resolveFileToken(
										argv["company"] as string | undefined,
										"company",
										"text"
									),
									email: resolveFileToken(
										argv["email"] as string | undefined,
										"email",
										"text"
									),
									email2: resolveFileToken(
										argv["email2"] as string | undefined,
										"email2",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									reported_country: resolveFileToken(
										argv["reported-country"] as string | undefined,
										"reported-country",
										"text"
									),
									reported_user_agent: resolveFileToken(
										argv["reported-user-agent"] as string | undefined,
										"reported-user-agent",
										"text"
									),
									tele: resolveFileToken(
										argv["tele"] as string | undefined,
										"tele",
										"text"
									),
									title: resolveFileToken(
										argv["title"] as string | undefined,
										"title",
										"text"
									),
									urls: resolveFileToken(
										argv["urls"] as string | undefined,
										"urls",
										"text"
									),
									address1: resolveFileToken(
										argv["address1"] as string | undefined,
										"address1",
										"text"
									),
									agent_name: resolveFileToken(
										argv["agent-name"] as string | undefined,
										"agent-name",
										"text"
									),
									agree: argv["agree"],
									city: resolveFileToken(
										argv["city"] as string | undefined,
										"city",
										"text"
									),
									country: resolveFileToken(
										argv["country"] as string | undefined,
										"country",
										"text"
									),
									host_notification: argv["host-notification"],
									original_work: resolveFileToken(
										argv["original-work"] as string | undefined,
										"original-work",
										"text"
									),
									owner_notification: argv["owner-notification"],
									signature: resolveFileToken(
										argv["signature"] as string | undefined,
										"signature",
										"text"
									),
									state: resolveFileToken(
										argv["state"] as string | undefined,
										"state",
										"text"
									),
									justification: resolveFileToken(
										argv["justification"] as string | undefined,
										"justification",
										"text"
									),
									trademark_number: resolveFileToken(
										argv["trademark-number"] as string | undefined,
										"trademark-number",
										"text"
									),
									trademark_office: resolveFileToken(
										argv["trademark-office"] as string | undefined,
										"trademark-office",
										"text"
									),
									trademark_symbol: resolveFileToken(
										argv["trademark-symbol"] as string | undefined,
										"trademark-symbol",
										"text"
									),
									destination_ips: resolveFileToken(
										argv["destination-ips"] as string | undefined,
										"destination-ips",
										"text"
									),
									ports_protocols: resolveFileToken(
										argv["ports-protocols"] as string | undefined,
										"ports-protocols",
										"text"
									),
									source_ips: resolveFileToken(
										argv["source-ips"] as string | undefined,
										"source-ips",
										"text"
									),
									ncmec_notification: argv["ncmec-notification"],
									reg_who_request: {
										reg_who_authorization_statement: resolveFileToken(
											argv[
												"reg-who-request-reg-who-authorization-statement"
											] as string | undefined,
											"reg-who-request-reg-who-authorization-statement",
											"text"
										),
										reg_who_good_faith_affirmation:
											argv["reg-who-request-reg-who-good-faith-affirmation"],
										reg_who_lawful_processing_agreement:
											argv[
												"reg-who-request-reg-who-lawful-processing-agreement"
											],
										reg_who_legal_basis: resolveFileToken(
											argv["reg-who-request-reg-who-legal-basis"] as
												| string
												| undefined,
											"reg-who-request-reg-who-legal-basis",
											"text"
										),
										reg_who_request_type:
											argv["reg-who-request-reg-who-request-type"],
										reg_who_requested_data_elements:
											argv["reg-who-request-reg-who-requested-data-elements"],
										reg_who_requestor_type:
											argv["reg-who-request-reg-who-requestor-type"],
									},
									ncsei_subject_representation:
										argv["ncsei-subject-representation"],
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
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/abuse-reports/${encodeURIComponent(String(argv["report-type"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["act"] !== undefined)
				setNestedValue(bodyData, ["act"], argv["act"]);
			if (argv["comments"] !== undefined)
				setNestedValue(
					bodyData,
					["comments"],
					resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					)
				);
			if (argv["company"] !== undefined)
				setNestedValue(
					bodyData,
					["company"],
					resolveFileToken(
						argv["company"] as string | undefined,
						"company",
						"text"
					)
				);
			if (argv["email"] !== undefined)
				setNestedValue(
					bodyData,
					["email"],
					resolveFileToken(argv["email"] as string | undefined, "email", "text")
				);
			if (argv["email2"] !== undefined)
				setNestedValue(
					bodyData,
					["email2"],
					resolveFileToken(
						argv["email2"] as string | undefined,
						"email2",
						"text"
					)
				);
			if (argv["name"] !== undefined)
				setNestedValue(
					bodyData,
					["name"],
					resolveFileToken(argv["name"] as string | undefined, "name", "text")
				);
			if (argv["reported-country"] !== undefined)
				setNestedValue(
					bodyData,
					["reported_country"],
					resolveFileToken(
						argv["reported-country"] as string | undefined,
						"reported-country",
						"text"
					)
				);
			if (argv["reported-user-agent"] !== undefined)
				setNestedValue(
					bodyData,
					["reported_user_agent"],
					resolveFileToken(
						argv["reported-user-agent"] as string | undefined,
						"reported-user-agent",
						"text"
					)
				);
			if (argv["tele"] !== undefined)
				setNestedValue(
					bodyData,
					["tele"],
					resolveFileToken(argv["tele"] as string | undefined, "tele", "text")
				);
			if (argv["title"] !== undefined)
				setNestedValue(
					bodyData,
					["title"],
					resolveFileToken(argv["title"] as string | undefined, "title", "text")
				);
			if (argv["urls"] !== undefined)
				setNestedValue(
					bodyData,
					["urls"],
					resolveFileToken(argv["urls"] as string | undefined, "urls", "text")
				);
			if (argv["address1"] !== undefined)
				setNestedValue(
					bodyData,
					["address1"],
					resolveFileToken(
						argv["address1"] as string | undefined,
						"address1",
						"text"
					)
				);
			if (argv["agent-name"] !== undefined)
				setNestedValue(
					bodyData,
					["agent_name"],
					resolveFileToken(
						argv["agent-name"] as string | undefined,
						"agent-name",
						"text"
					)
				);
			if (argv["agree"] !== undefined)
				setNestedValue(bodyData, ["agree"], argv["agree"]);
			if (argv["city"] !== undefined)
				setNestedValue(
					bodyData,
					["city"],
					resolveFileToken(argv["city"] as string | undefined, "city", "text")
				);
			if (argv["country"] !== undefined)
				setNestedValue(
					bodyData,
					["country"],
					resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
					)
				);
			if (argv["host-notification"] !== undefined)
				setNestedValue(
					bodyData,
					["host_notification"],
					argv["host-notification"]
				);
			if (argv["original-work"] !== undefined)
				setNestedValue(
					bodyData,
					["original_work"],
					resolveFileToken(
						argv["original-work"] as string | undefined,
						"original-work",
						"text"
					)
				);
			if (argv["owner-notification"] !== undefined)
				setNestedValue(
					bodyData,
					["owner_notification"],
					argv["owner-notification"]
				);
			if (argv["signature"] !== undefined)
				setNestedValue(
					bodyData,
					["signature"],
					resolveFileToken(
						argv["signature"] as string | undefined,
						"signature",
						"text"
					)
				);
			if (argv["state"] !== undefined)
				setNestedValue(
					bodyData,
					["state"],
					resolveFileToken(argv["state"] as string | undefined, "state", "text")
				);
			if (argv["justification"] !== undefined)
				setNestedValue(
					bodyData,
					["justification"],
					resolveFileToken(
						argv["justification"] as string | undefined,
						"justification",
						"text"
					)
				);
			if (argv["trademark-number"] !== undefined)
				setNestedValue(
					bodyData,
					["trademark_number"],
					resolveFileToken(
						argv["trademark-number"] as string | undefined,
						"trademark-number",
						"text"
					)
				);
			if (argv["trademark-office"] !== undefined)
				setNestedValue(
					bodyData,
					["trademark_office"],
					resolveFileToken(
						argv["trademark-office"] as string | undefined,
						"trademark-office",
						"text"
					)
				);
			if (argv["trademark-symbol"] !== undefined)
				setNestedValue(
					bodyData,
					["trademark_symbol"],
					resolveFileToken(
						argv["trademark-symbol"] as string | undefined,
						"trademark-symbol",
						"text"
					)
				);
			if (argv["destination-ips"] !== undefined)
				setNestedValue(
					bodyData,
					["destination_ips"],
					resolveFileToken(
						argv["destination-ips"] as string | undefined,
						"destination-ips",
						"text"
					)
				);
			if (argv["ports-protocols"] !== undefined)
				setNestedValue(
					bodyData,
					["ports_protocols"],
					resolveFileToken(
						argv["ports-protocols"] as string | undefined,
						"ports-protocols",
						"text"
					)
				);
			if (argv["source-ips"] !== undefined)
				setNestedValue(
					bodyData,
					["source_ips"],
					resolveFileToken(
						argv["source-ips"] as string | undefined,
						"source-ips",
						"text"
					)
				);
			if (argv["ncmec-notification"] !== undefined)
				setNestedValue(
					bodyData,
					["ncmec_notification"],
					argv["ncmec-notification"]
				);
			if (argv["reg-who-request-reg-who-authorization-statement"] !== undefined)
				setNestedValue(
					bodyData,
					["reg_who_request", "reg_who_authorization_statement"],
					resolveFileToken(
						argv["reg-who-request-reg-who-authorization-statement"] as
							| string
							| undefined,
						"reg-who-request-reg-who-authorization-statement",
						"text"
					)
				);
			if (argv["reg-who-request-reg-who-good-faith-affirmation"] !== undefined)
				setNestedValue(
					bodyData,
					["reg_who_request", "reg_who_good_faith_affirmation"],
					argv["reg-who-request-reg-who-good-faith-affirmation"]
				);
			if (
				argv["reg-who-request-reg-who-lawful-processing-agreement"] !==
				undefined
			)
				setNestedValue(
					bodyData,
					["reg_who_request", "reg_who_lawful_processing_agreement"],
					argv["reg-who-request-reg-who-lawful-processing-agreement"]
				);
			if (argv["reg-who-request-reg-who-legal-basis"] !== undefined)
				setNestedValue(
					bodyData,
					["reg_who_request", "reg_who_legal_basis"],
					resolveFileToken(
						argv["reg-who-request-reg-who-legal-basis"] as string | undefined,
						"reg-who-request-reg-who-legal-basis",
						"text"
					)
				);
			if (argv["reg-who-request-reg-who-request-type"] !== undefined)
				setNestedValue(
					bodyData,
					["reg_who_request", "reg_who_request_type"],
					argv["reg-who-request-reg-who-request-type"]
				);
			if (argv["reg-who-request-reg-who-requested-data-elements"] !== undefined)
				setNestedValue(
					bodyData,
					["reg_who_request", "reg_who_requested_data_elements"],
					argv["reg-who-request-reg-who-requested-data-elements"]
				);
			if (argv["reg-who-request-reg-who-requestor-type"] !== undefined)
				setNestedValue(
					bodyData,
					["reg_who_request", "reg_who_requestor_type"],
					argv["reg-who-request-reg-who-requestor-type"]
				);
			if (argv["ncsei-subject-representation"] !== undefined)
				setNestedValue(
					bodyData,
					["ncsei_subject_representation"],
					argv["ncsei-subject-representation"]
				);
			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/abuse-reports/${encodeURIComponent(String(argv["report-type"]))}`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
