import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "registrar-sandbox registrations create",
			classification: {
				safeFlags: ["auto-renew", "privacy-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["prefer"] !== undefined)
				headers["Prefer"] = String(argv["prefer"]);
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["domain-name"] === undefined) {
					argv["domain-name"] = await promptForRequiredField(
						"domain-name",
						"Provides a fully qualified domain name (FQDN), including the extension (e.g., \`example.com\`, \`mybrand.app\`). The domain name uniquely identifies a registration. Cloudflare permits only one registration per domain, making the domain name a natural idempotency key for registration requests. "
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf registrar-sandbox registrations create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar-sandbox/registrations`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										acknowledgements: parseJsonMap(
											argv["acknowledgements"],
											"acknowledgements"
										),
										auto_renew: argv["auto-renew"],
										contact_extensions: parseJsonMap(
											argv["contact-extensions"],
											"contact-extensions"
										),
										contacts: {
											administrator: {
												email: resolveFileToken(
													argv["contacts-administrator-email"] as
														| string
														| undefined,
													"contacts-administrator-email",
													"text"
												),
												fax: resolveFileToken(
													argv["contacts-administrator-fax"] as
														| string
														| undefined,
													"contacts-administrator-fax",
													"text"
												),
												phone: resolveFileToken(
													argv["contacts-administrator-phone"] as
														| string
														| undefined,
													"contacts-administrator-phone",
													"text"
												),
												postal_info: {
													name: resolveFileToken(
														argv["contacts-administrator-postal-info-name"] as
															| string
															| undefined,
														"contacts-administrator-postal-info-name",
														"text"
													),
													organization: resolveFileToken(
														argv[
															"contacts-administrator-postal-info-organization"
														] as string | undefined,
														"contacts-administrator-postal-info-organization",
														"text"
													),
												},
											},
											billing: {
												email: resolveFileToken(
													argv["contacts-billing-email"] as string | undefined,
													"contacts-billing-email",
													"text"
												),
												fax: resolveFileToken(
													argv["contacts-billing-fax"] as string | undefined,
													"contacts-billing-fax",
													"text"
												),
												phone: resolveFileToken(
													argv["contacts-billing-phone"] as string | undefined,
													"contacts-billing-phone",
													"text"
												),
												postal_info: {
													name: resolveFileToken(
														argv["contacts-billing-postal-info-name"] as
															| string
															| undefined,
														"contacts-billing-postal-info-name",
														"text"
													),
													organization: resolveFileToken(
														argv[
															"contacts-billing-postal-info-organization"
														] as string | undefined,
														"contacts-billing-postal-info-organization",
														"text"
													),
												},
											},
											registrant: {
												email: resolveFileToken(
													argv["contacts-registrant-email"] as
														| string
														| undefined,
													"contacts-registrant-email",
													"text"
												),
												fax: resolveFileToken(
													argv["contacts-registrant-fax"] as string | undefined,
													"contacts-registrant-fax",
													"text"
												),
												phone: resolveFileToken(
													argv["contacts-registrant-phone"] as
														| string
														| undefined,
													"contacts-registrant-phone",
													"text"
												),
												postal_info: {
													name: resolveFileToken(
														argv["contacts-registrant-postal-info-name"] as
															| string
															| undefined,
														"contacts-registrant-postal-info-name",
														"text"
													),
													organization: resolveFileToken(
														argv[
															"contacts-registrant-postal-info-organization"
														] as string | undefined,
														"contacts-registrant-postal-info-organization",
														"text"
													),
												},
											},
											technical: {
												email: resolveFileToken(
													argv["contacts-technical-email"] as
														| string
														| undefined,
													"contacts-technical-email",
													"text"
												),
												fax: resolveFileToken(
													argv["contacts-technical-fax"] as string | undefined,
													"contacts-technical-fax",
													"text"
												),
												phone: resolveFileToken(
													argv["contacts-technical-phone"] as
														| string
														| undefined,
													"contacts-technical-phone",
													"text"
												),
												postal_info: {
													name: resolveFileToken(
														argv["contacts-technical-postal-info-name"] as
															| string
															| undefined,
														"contacts-technical-postal-info-name",
														"text"
													),
													organization: resolveFileToken(
														argv[
															"contacts-technical-postal-info-organization"
														] as string | undefined,
														"contacts-technical-postal-info-organization",
														"text"
													),
												},
											},
										},
										domain_name: resolveFileToken(
											argv["domain-name"] as string | undefined,
											"domain-name",
											"text"
										),
										privacy_mode: argv["privacy-mode"],
										years: argv["years"],
									},
									[["acknowledgements"], ["contact_extensions"]]
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
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/registrar-sandbox/registrations`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["acknowledgements"] !== undefined)
				setNestedValue(
					bodyData,
					["acknowledgements"],
					parseJsonMap(argv["acknowledgements"], "acknowledgements")
				);
			if (argv["auto-renew"] !== undefined)
				setNestedValue(bodyData, ["auto_renew"], argv["auto-renew"]);
			if (argv["contact-extensions"] !== undefined)
				setNestedValue(
					bodyData,
					["contact_extensions"],
					parseJsonMap(argv["contact-extensions"], "contact-extensions")
				);
			if (argv["contacts-administrator-email"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "administrator", "email"],
					resolveFileToken(
						argv["contacts-administrator-email"] as string | undefined,
						"contacts-administrator-email",
						"text"
					)
				);
			if (argv["contacts-administrator-fax"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "administrator", "fax"],
					resolveFileToken(
						argv["contacts-administrator-fax"] as string | undefined,
						"contacts-administrator-fax",
						"text"
					)
				);
			if (argv["contacts-administrator-phone"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "administrator", "phone"],
					resolveFileToken(
						argv["contacts-administrator-phone"] as string | undefined,
						"contacts-administrator-phone",
						"text"
					)
				);
			if (argv["contacts-administrator-postal-info-name"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "administrator", "postal_info", "name"],
					resolveFileToken(
						argv["contacts-administrator-postal-info-name"] as
							| string
							| undefined,
						"contacts-administrator-postal-info-name",
						"text"
					)
				);
			if (argv["contacts-administrator-postal-info-organization"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "administrator", "postal_info", "organization"],
					resolveFileToken(
						argv["contacts-administrator-postal-info-organization"] as
							| string
							| undefined,
						"contacts-administrator-postal-info-organization",
						"text"
					)
				);
			if (argv["contacts-billing-email"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "billing", "email"],
					resolveFileToken(
						argv["contacts-billing-email"] as string | undefined,
						"contacts-billing-email",
						"text"
					)
				);
			if (argv["contacts-billing-fax"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "billing", "fax"],
					resolveFileToken(
						argv["contacts-billing-fax"] as string | undefined,
						"contacts-billing-fax",
						"text"
					)
				);
			if (argv["contacts-billing-phone"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "billing", "phone"],
					resolveFileToken(
						argv["contacts-billing-phone"] as string | undefined,
						"contacts-billing-phone",
						"text"
					)
				);
			if (argv["contacts-billing-postal-info-name"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "billing", "postal_info", "name"],
					resolveFileToken(
						argv["contacts-billing-postal-info-name"] as string | undefined,
						"contacts-billing-postal-info-name",
						"text"
					)
				);
			if (argv["contacts-billing-postal-info-organization"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "billing", "postal_info", "organization"],
					resolveFileToken(
						argv["contacts-billing-postal-info-organization"] as
							| string
							| undefined,
						"contacts-billing-postal-info-organization",
						"text"
					)
				);
			if (argv["contacts-registrant-email"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "registrant", "email"],
					resolveFileToken(
						argv["contacts-registrant-email"] as string | undefined,
						"contacts-registrant-email",
						"text"
					)
				);
			if (argv["contacts-registrant-fax"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "registrant", "fax"],
					resolveFileToken(
						argv["contacts-registrant-fax"] as string | undefined,
						"contacts-registrant-fax",
						"text"
					)
				);
			if (argv["contacts-registrant-phone"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "registrant", "phone"],
					resolveFileToken(
						argv["contacts-registrant-phone"] as string | undefined,
						"contacts-registrant-phone",
						"text"
					)
				);
			if (argv["contacts-registrant-postal-info-name"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "registrant", "postal_info", "name"],
					resolveFileToken(
						argv["contacts-registrant-postal-info-name"] as string | undefined,
						"contacts-registrant-postal-info-name",
						"text"
					)
				);
			if (argv["contacts-registrant-postal-info-organization"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "registrant", "postal_info", "organization"],
					resolveFileToken(
						argv["contacts-registrant-postal-info-organization"] as
							| string
							| undefined,
						"contacts-registrant-postal-info-organization",
						"text"
					)
				);
			if (argv["contacts-technical-email"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "technical", "email"],
					resolveFileToken(
						argv["contacts-technical-email"] as string | undefined,
						"contacts-technical-email",
						"text"
					)
				);
			if (argv["contacts-technical-fax"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "technical", "fax"],
					resolveFileToken(
						argv["contacts-technical-fax"] as string | undefined,
						"contacts-technical-fax",
						"text"
					)
				);
			if (argv["contacts-technical-phone"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "technical", "phone"],
					resolveFileToken(
						argv["contacts-technical-phone"] as string | undefined,
						"contacts-technical-phone",
						"text"
					)
				);
			if (argv["contacts-technical-postal-info-name"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "technical", "postal_info", "name"],
					resolveFileToken(
						argv["contacts-technical-postal-info-name"] as string | undefined,
						"contacts-technical-postal-info-name",
						"text"
					)
				);
			if (argv["contacts-technical-postal-info-organization"] !== undefined)
				setNestedValue(
					bodyData,
					["contacts", "technical", "postal_info", "organization"],
					resolveFileToken(
						argv["contacts-technical-postal-info-organization"] as
							| string
							| undefined,
						"contacts-technical-postal-info-organization",
						"text"
					)
				);
			if (argv["domain-name"] !== undefined)
				setNestedValue(
					bodyData,
					["domain_name"],
					resolveFileToken(
						argv["domain-name"] as string | undefined,
						"domain-name",
						"text"
					)
				);
			if (argv["privacy-mode"] !== undefined)
				setNestedValue(bodyData, ["privacy_mode"], argv["privacy-mode"]);
			if (argv["years"] !== undefined)
				setNestedValue(bodyData, ["years"], argv["years"]);
			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/registrar-sandbox/registrations`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
