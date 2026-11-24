import operation from "../../_operations/billing/profiles/update.js";
/**
 * update command
 * @generated from apis/overlays/billing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update Billing Profile",
	usage:
		"$0 billing profiles update\n\nUpdates the billing profile for an account.",
	flags: {
		address: {
			kind: "parsed",
			brief: "Street address line 1.",
			optional: true,
			parse: String,
		},
		address2: {
			kind: "parsed",
			brief: "Street address line 2 (apt, suite, etc.).",
			optional: true,
			parse: String,
		},
		"billing-email": {
			kind: "parsed",
			brief: "Primary billing email address.",
			optional: true,
			parse: String,
		},
		"buying-rate-plan": {
			kind: "parsed",
			brief: "Rate plan being purchased right after profile setup.",
			optional: true,
			parse: String,
		},
		"captcha-challenge-jwt": {
			kind: "parsed",
			brief: "Captcha challenge JWT issued during onboarding.",
			optional: true,
			parse: String,
		},
		"cf-turnstile-response": {
			kind: "parsed",
			brief: "Cloudflare Turnstile response.",
			optional: true,
			parse: String,
		},
		city: {
			kind: "parsed",
			brief: "City on the billing profile.",
			optional: true,
			parse: String,
		},
		company: {
			kind: "parsed",
			brief: "Company name on the billing profile.",
			optional: true,
			parse: String,
		},
		country: {
			kind: "parsed",
			brief: "ISO 3166-1 alpha-2 country code.",
			optional: true,
			parse: String,
		},
		"first-name": {
			kind: "parsed",
			brief: "First name on the billing profile.",
			optional: true,
			parse: String,
		},
		"h-captcha-response": {
			kind: "parsed",
			brief: "hCaptcha response.",
			optional: true,
			parse: String,
		},
		"last-name": {
			kind: "parsed",
			brief: "Last name on the billing profile.",
			optional: true,
			parse: String,
		},
		"preferred-locale": {
			kind: "parsed",
			brief: "Preferred locale for invoice rendering (BCP 47).",
			optional: true,
			parse: String,
		},
		"secondary-billing-email": {
			kind: "parsed",
			brief: "Secondary billing email address for CC on invoices.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "State or region on the billing profile.",
			optional: true,
			parse: String,
		},
		"tax-id-type": {
			kind: "parsed",
			brief: "Type of tax ID provided.",
			optional: true,
			parse: String,
		},
		telephone: {
			kind: "parsed",
			brief: "Contact phone number.",
			optional: true,
			parse: String,
		},
		vat: {
			kind: "parsed",
			brief: "VAT identifier.",
			optional: true,
			parse: String,
		},
		zipcode: {
			kind: "parsed",
			brief: "ZIP or postal code.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for creating or updating a billing profile.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing profiles update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing profiles update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billing/profile`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										address: resolveFileToken(
											argv["address"] as string | undefined,
											"address",
											"text"
										),
										address2: resolveFileToken(
											argv["address2"] as string | undefined,
											"address2",
											"text"
										),
										billing_email: resolveFileToken(
											argv["billing-email"] as string | undefined,
											"billing-email",
											"text"
										),
										buying_rate_plan: resolveFileToken(
											argv["buying-rate-plan"] as string | undefined,
											"buying-rate-plan",
											"text"
										),
										captcha_challenge_jwt: resolveFileToken(
											argv["captcha-challenge-jwt"] as string | undefined,
											"captcha-challenge-jwt",
											"text"
										),
										cf_turnstile_response: resolveFileToken(
											argv["cf-turnstile-response"] as string | undefined,
											"cf-turnstile-response",
											"text"
										),
										city: resolveFileToken(
											argv["city"] as string | undefined,
											"city",
											"text"
										),
										company: resolveFileToken(
											argv["company"] as string | undefined,
											"company",
											"text"
										),
										country: resolveFileToken(
											argv["country"] as string | undefined,
											"country",
											"text"
										),
										first_name: resolveFileToken(
											argv["first-name"] as string | undefined,
											"first-name",
											"text"
										),
										h_captcha_response: resolveFileToken(
											argv["h-captcha-response"] as string | undefined,
											"h-captcha-response",
											"text"
										),
										last_name: resolveFileToken(
											argv["last-name"] as string | undefined,
											"last-name",
											"text"
										),
										preferred_locale: resolveFileToken(
											argv["preferred-locale"] as string | undefined,
											"preferred-locale",
											"text"
										),
										secondary_billing_email: resolveFileToken(
											argv["secondary-billing-email"] as string | undefined,
											"secondary-billing-email",
											"text"
										),
										state: resolveFileToken(
											argv["state"] as string | undefined,
											"state",
											"text"
										),
										tax_id_type: resolveFileToken(
											argv["tax-id-type"] as string | undefined,
											"tax-id-type",
											"text"
										),
										telephone: resolveFileToken(
											argv["telephone"] as string | undefined,
											"telephone",
											"text"
										),
										vat: resolveFileToken(
											argv["vat"] as string | undefined,
											"vat",
											"text"
										),
										zipcode: resolveFileToken(
											argv["zipcode"] as string | undefined,
											"zipcode",
											"text"
										),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					address: resolveFileToken(
						argv["address"] as string | undefined,
						"address",
						"text"
					),
					address2: resolveFileToken(
						argv["address2"] as string | undefined,
						"address2",
						"text"
					),
					billing_email: resolveFileToken(
						argv["billing-email"] as string | undefined,
						"billing-email",
						"text"
					),
					buying_rate_plan: resolveFileToken(
						argv["buying-rate-plan"] as string | undefined,
						"buying-rate-plan",
						"text"
					),
					captcha_challenge_jwt: resolveFileToken(
						argv["captcha-challenge-jwt"] as string | undefined,
						"captcha-challenge-jwt",
						"text"
					),
					cf_turnstile_response: resolveFileToken(
						argv["cf-turnstile-response"] as string | undefined,
						"cf-turnstile-response",
						"text"
					),
					city: resolveFileToken(
						argv["city"] as string | undefined,
						"city",
						"text"
					),
					company: resolveFileToken(
						argv["company"] as string | undefined,
						"company",
						"text"
					),
					country: resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
					),
					first_name: resolveFileToken(
						argv["first-name"] as string | undefined,
						"first-name",
						"text"
					),
					h_captcha_response: resolveFileToken(
						argv["h-captcha-response"] as string | undefined,
						"h-captcha-response",
						"text"
					),
					last_name: resolveFileToken(
						argv["last-name"] as string | undefined,
						"last-name",
						"text"
					),
					preferred_locale: resolveFileToken(
						argv["preferred-locale"] as string | undefined,
						"preferred-locale",
						"text"
					),
					secondary_billing_email: resolveFileToken(
						argv["secondary-billing-email"] as string | undefined,
						"secondary-billing-email",
						"text"
					),
					state: resolveFileToken(
						argv["state"] as string | undefined,
						"state",
						"text"
					),
					tax_id_type: resolveFileToken(
						argv["tax-id-type"] as string | undefined,
						"tax-id-type",
						"text"
					),
					telephone: resolveFileToken(
						argv["telephone"] as string | undefined,
						"telephone",
						"text"
					),
					vat: resolveFileToken(
						argv["vat"] as string | undefined,
						"vat",
						"text"
					),
					zipcode: resolveFileToken(
						argv["zipcode"] as string | undefined,
						"zipcode",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
