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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 registrar-sandbox registrations create\n\nStarts a domain registration workflow. ### Prerequisites - The account must not already be at the maximum supported domain limit. A single account may own up to 500 domains in total across registrations created through either the dashboard or this API. - The domain must be on a supported extension for programmatic registration. - Use `POST /domain-check` immediately before calling this endpoint to confirm real-time availability and pricing. ### Defaults - `years`: defaults to the extension's minimum registration period (1 year for most extensions, but varies — for example, `.ai` (if supported) requires a minimum of 2 years). - `auto_renew`: defaults to `false`. Setting it to `true` is an explicit opt-in authorizing Cloudflare to charge the account's default payment method up to 30 days before domain expiry to renew the registration. Renewal pricing may change over time based on registry pricing. - `privacy_mode`: defaults to `redaction`. ### Premium domains Premium domain registration is not currently supported by this API. If `POST /domain-check` returns `tier: premium`, do not call this endpoint for that domain. ### Response behavior By default, the server holds the connection for a bounded, server-defined amount of time while the registration completes. Most registrations finish within this window and return `201 Created` with a completed workflow status. If the registration is still processing after this synchronous wait window, the server returns `202 Accepted`. Poll the URL in `links.self` to track progress. To skip the wait and receive an immediate `202`, send `Prefer: respond-async`."
		)
		.option("prefer", {
			type: "string",
			description:
				"Set to `respond-async` to receive an immediate `202 Accepted` without\nwaiting for the operation to complete (RFC 7240).\n\nThe header may be combined with other preferences using standard\ncomma-separated syntax.",
		})
		.option("auto-renew", {
			type: "boolean",
			description:
				"Enable or disable automatic renewal. Defaults to `false` if omitted.\nSetting this field to `true` is an explicit opt-in authorizing\nCloudflare to charge the account's default payment method up to 30\ndays before domain expiry to renew the domain automatically.\nRenewal pricing may change over time based on registry pricing.\n",
			default: false,
		})
		.option("contacts-administrator-email", {
			type: "string",
			description:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
		})
		.option("contacts-administrator-fax", {
			type: "string",
			description:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
		})
		.option("contacts-administrator-phone", {
			type: "string",
			description:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
		})
		.option("contacts-administrator-postal-info-name", {
			type: "string",
			description:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
		})
		.option("contacts-administrator-postal-info-organization", {
			type: "string",
			description:
				"Organization or company name. Optional for individual registrants.",
		})
		.option("contacts-billing-email", {
			type: "string",
			description:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
		})
		.option("contacts-billing-fax", {
			type: "string",
			description:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
		})
		.option("contacts-billing-phone", {
			type: "string",
			description:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
		})
		.option("contacts-billing-postal-info-name", {
			type: "string",
			description:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
		})
		.option("contacts-billing-postal-info-organization", {
			type: "string",
			description:
				"Organization or company name. Optional for individual registrants.",
		})
		.option("contacts-registrant-email", {
			type: "string",
			description:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
		})
		.option("contacts-registrant-fax", {
			type: "string",
			description:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
		})
		.option("contacts-registrant-phone", {
			type: "string",
			description:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
		})
		.option("contacts-registrant-postal-info-name", {
			type: "string",
			description:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
		})
		.option("contacts-registrant-postal-info-organization", {
			type: "string",
			description:
				"Organization or company name. Optional for individual registrants.",
		})
		.option("contacts-technical-email", {
			type: "string",
			description:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
		})
		.option("contacts-technical-fax", {
			type: "string",
			description:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
		})
		.option("contacts-technical-phone", {
			type: "string",
			description:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
		})
		.option("contacts-technical-postal-info-name", {
			type: "string",
			description:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
		})
		.option("contacts-technical-postal-info-organization", {
			type: "string",
			description:
				"Organization or company name. Optional for individual registrants.",
		})
		.option("domain-name", {
			type: "string",
			description:
				"Provides a fully qualified domain name (FQDN), including the extension\n(e.g., `example.com`, `mybrand.app`). The domain name uniquely identifies\na registration. Cloudflare permits only one registration per domain, making\nthe domain name a natural idempotency key for registration requests.\n",
		})
		.option("privacy-mode", {
			type: "string",
			description:
				"Sets the WHOIS privacy mode for the registration. Defaults to `redaction`.\n- `off`: Disables WHOIS privacy.\n- `redaction`: Requests WHOIS redaction where the extension supports it.\n  Some extensions exclude privacy and redaction.\n",
			choices: ["off", "redaction"],
			default: "redaction",
		})
		.option("years", {
			type: "number",
			description:
				"Sets the registration term from 1 to 10 years. When omitted, this\nfield defaults to the registry's minimum registration period for the\nextension. Most extensions require 1 year, while some require longer\nminimum terms (e.g., `.ai` requires 2 years).\n\nEach registry may also enforce its own maximum registration term. A\nrequest above that maximum fails. When uncertain, omit this field to\nuse the default.\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"contacts-administrator-email",
				"contacts-administrator-fax",
				"contacts-administrator-phone",
				"contacts-administrator-postal-info-name",
				"contacts-administrator-postal-info-organization",
				"contacts-billing-email",
				"contacts-billing-fax",
				"contacts-billing-phone",
				"contacts-billing-postal-info-name",
				"contacts-billing-postal-info-organization",
				"contacts-registrant-email",
				"contacts-registrant-fax",
				"contacts-registrant-phone",
				"contacts-registrant-postal-info-name",
				"contacts-registrant-postal-info-organization",
				"contacts-technical-email",
				"contacts-technical-fax",
				"contacts-technical-phone",
				"contacts-technical-postal-info-name",
				"contacts-technical-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"contacts-administrator-email",
					"contacts-administrator-phone",
					"contacts-administrator-postal-info-name",
					"contacts-billing-email",
					"contacts-billing-phone",
					"contacts-billing-postal-info-name",
					"contacts-registrant-email",
					"contacts-registrant-phone",
					"contacts-registrant-postal-info-name",
					"contacts-technical-email",
					"contacts-technical-phone",
					"contacts-technical-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Registration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar-sandbox registrations create",
				classification: {
					safeFlags: ["auto-renew", "privacy-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["prefer"] !== undefined)
					headers["Prefer"] = String(argv["prefer"]);
				if (argv.dryRun) {
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
								: compactBody({
										auto_renew: argv["auto-renew"],
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
														argv["contacts-billing-postal-info-organization"] as
															| string
															| undefined,
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
										privacy_mode: resolveFileToken(
											argv["privacy-mode"] as string | undefined,
											"privacy-mode",
											"text"
										),
										years: argv["years"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
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
				if (argv["domain-name"] === undefined) {
					argv["domain-name"] = await promptForRequiredField(
						"domain-name",
						"Provides a fully qualified domain name (FQDN), including the extension (e.g., \`example.com\`, \`mybrand.app\`). The domain name uniquely identifies a registration. Cloudflare permits only one registration per domain, making the domain name a natural idempotency key for registration requests. "
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["auto-renew"] !== undefined)
					setNestedValue(bodyData, ["auto_renew"], argv["auto-renew"]);
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
				if (
					argv["contacts-administrator-postal-info-organization"] !== undefined
				)
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
							argv["contacts-registrant-postal-info-name"] as
								| string
								| undefined,
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
					setNestedValue(
						bodyData,
						["privacy_mode"],
						resolveFileToken(
							argv["privacy-mode"] as string | undefined,
							"privacy-mode",
							"text"
						)
					);
				if (argv["years"] !== undefined)
					setNestedValue(bodyData, ["years"], argv["years"]);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/registrar-sandbox/registrations`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
