/**
 * transfer-in command
 * @generated from apis/overlays/registrar.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "transfer-in <domain-name>",
	describe: "Initiate Transfer",
	usage:
		"$0 registrar registrations transfer-in <domain-name>\n\nStarts a domain transfer-in workflow. This is typically a billable operation — successful transfers charge the account's default payment method, except for extensions with zero transfer pricing (e.g. UK extensions). All successful domain transfers are non-refundable. ### How transfers work Domain transfers move a domain from another registrar to Cloudflare. Transfers typically take 1-10 days due to ICANN-mandated approval windows. ### Prerequisites - The domain must already have a zone in the Cloudflare account (added through the dashboard or zone API). - The zone must have DNSSec disabled. - For billable transfers (i.e. extensions with non-zero transfer pricing), the account must have a billing profile with a valid default payment method. Set this up at `https://dash.cloudflare.com/{account_id}/billing/payment-info`. - The domain must be unlocked at the current registrar. - An authorization/EPP code from the current registrar is required, except for UK extensions — see Auth code below. ### Auth code An authorization code (also called EPP code, transfer key, or auth-info code) is required for most extensions, with the exception of UK extensions. Obtain this from your current registrar's control panel. The auth code in the request body must be base64-encoded per RFC 4648 §4 (standard alphabet, no line breaks). ### Response behavior Successful transfer initiation returns `202 Accepted`. Validation or initiation failures return the documented `4XX` responses. Poll `GET /accounts/{account_id}/registrar/registrations/{domain_name}/transfer-in-status` to track progress. ### Premium domains Premium domain transfers are not currently supported by this API. Please use the [dashboard](https://dash.cloudflare.com/) for now. ### Billing The account's default payment method is charged upon successful transfer completion, unless the extension has zero transfer pricing (e.g. UK extensions). The transfer adds time to the domain's existing expiration date (typically 1 year).",
	flags: {
		prefer: {
			kind: "parsed",
			brief:
				"Set to `respond-async` to indicate a preference for asynchronous\nprocessing (RFC 7240).",
			optional: true,
			parse: String,
		},
		"auth-code": {
			kind: "parsed",
			brief:
				"The EPP/authorization code from your current registrar, base64-encoded\nper RFC 4648 §4. Obtain this from your current registrar's control panel.\nRequired for all extensions, except for UK.\n",
			optional: true,
			parse: String,
		},
		"auto-renew": {
			kind: "boolean",
			brief:
				"Enable or disable automatic renewal after transfer. Defaults to `false` if omitted.\n",
			default: false,
		},
		"contact-extensions": {
			kind: "parsed",
			brief:
				'Registry-specific contact extension values for the registrant.\n`GET /accounts/{account_id}/registrar/extensions/{extension}` documents the\nrequired keys and allowed values for each extension in the\n`transfer_schema.properties.contact_extensions` object.\n\nExamples include `.us` nexus fields, `.uk` registrant type fields,\nand `.ca` legal type fields. Include this object only when the extension\'s\ntransfer schema defines `contact_extensions`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"contacts-administrator-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-administrator-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-administrator-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-administrator-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-administrator-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"contacts-billing-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-billing-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-billing-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-billing-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-billing-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"contacts-registrant-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-registrant-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-registrant-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-registrant-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-registrant-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"contacts-technical-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-technical-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-technical-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-technical-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-technical-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"privacy-mode": {
			kind: "parsed",
			brief:
				"WHOIS privacy mode to apply after transfer completes. Defaults to\nthe extension's default privacy mode (typically `redaction`).\n",
			optional: true,
			choices: ["off", "redaction"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "privacy-mode", "text"),
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
	operands: [
		{
			placeholder: "domain-name",
			brief: "Domain name to transfer.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"contacts-administrator-email",
				"contacts-administrator-fax",
				"contacts-administrator-phone",
				"contacts-administrator-postal-info-name",
				"contacts-administrator-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-administrator-email",
					"contacts-administrator-phone",
					"contacts-administrator-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-administrator-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"contacts-billing-email",
				"contacts-billing-fax",
				"contacts-billing-phone",
				"contacts-billing-postal-info-name",
				"contacts-billing-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-billing-email",
					"contacts-billing-phone",
					"contacts-billing-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-billing-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"contacts-registrant-email",
				"contacts-registrant-fax",
				"contacts-registrant-phone",
				"contacts-registrant-postal-info-name",
				"contacts-registrant-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-registrant-email",
					"contacts-registrant-phone",
					"contacts-registrant-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-registrant-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"contacts-technical-email",
				"contacts-technical-fax",
				"contacts-technical-phone",
				"contacts-technical-postal-info-name",
				"contacts-technical-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-technical-email",
					"contacts-technical-phone",
					"contacts-technical-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-technical-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar registrations transfer-in",
				classification: {
					safeFlags: ["auto-renew", "privacy-mode", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["prefer"] !== undefined)
					headers["Prefer"] = String(argv["prefer"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar registrations transfer-in",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar/registrations/${argv["domain-name"] == null ? "<domain-name>" : encodeURIComponent(String(argv["domain-name"]))}/transfer-in`,
						pathParams: { "domain-name": String(argv["domain-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											auth_code: resolveFileToken(
												argv["auth-code"] as string | undefined,
												"auth-code",
												"text"
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
															argv[
																"contacts-administrator-postal-info-name"
															] as string | undefined,
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
														argv["contacts-billing-email"] as
															| string
															| undefined,
														"contacts-billing-email",
														"text"
													),
													fax: resolveFileToken(
														argv["contacts-billing-fax"] as string | undefined,
														"contacts-billing-fax",
														"text"
													),
													phone: resolveFileToken(
														argv["contacts-billing-phone"] as
															| string
															| undefined,
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
														argv["contacts-registrant-fax"] as
															| string
															| undefined,
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
														argv["contacts-technical-fax"] as
															| string
															| undefined,
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
											privacy_mode: argv["privacy-mode"],
										},
										[["contact_extensions"]]
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
							`/accounts/${accountId}/registrar/registrations/${encodeURIComponent(String(argv["domain-name"]))}/transfer-in`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["auth-code"] !== undefined)
					setNestedValue(
						bodyData,
						["auth_code"],
						resolveFileToken(
							argv["auth-code"] as string | undefined,
							"auth-code",
							"text"
						)
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
				if (argv["privacy-mode"] !== undefined)
					setNestedValue(bodyData, ["privacy_mode"], argv["privacy-mode"]);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/registrar/registrations/${encodeURIComponent(String(argv["domain-name"]))}/transfer-in`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
