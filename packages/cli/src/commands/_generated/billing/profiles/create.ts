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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/billing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 billing profiles create\n\nCreates a billing profile for an account."
		)
		.option("address", {
			type: "string",
			description: "Street address line 1.",
		})
		.option("address2", {
			type: "string",
			description: "Street address line 2 (apt, suite, etc.).",
		})
		.option("billing-email", {
			type: "string",
			description: "Primary billing email address.",
		})
		.option("buying-rate-plan", {
			type: "string",
			description: "Rate plan being purchased right after profile setup.",
		})
		.option("captcha-challenge-jwt", {
			type: "string",
			description: "Captcha challenge JWT issued during onboarding.",
		})
		.option("cf-turnstile-response", {
			type: "string",
			description: "Cloudflare Turnstile response.",
		})
		.option("city", {
			type: "string",
			description: "City on the billing profile.",
		})
		.option("company", {
			type: "string",
			description: "Company name on the billing profile.",
		})
		.option("country", {
			type: "string",
			description: "ISO 3166-1 alpha-2 country code.",
		})
		.option("first-name", {
			type: "string",
			description: "First name on the billing profile.",
		})
		.option("h-captcha-response", {
			type: "string",
			description: "hCaptcha response.",
		})
		.option("last-name", {
			type: "string",
			description: "Last name on the billing profile.",
		})
		.option("preferred-locale", {
			type: "string",
			description: "Preferred locale for invoice rendering (BCP 47).",
		})
		.option("secondary-billing-email", {
			type: "string",
			description: "Secondary billing email address for CC on invoices.",
		})
		.option("state", {
			type: "string",
			description: "State or region on the billing profile.",
		})
		.option("tax-id-type", {
			type: "string",
			description: "Type of tax ID provided.",
		})
		.option("telephone", {
			type: "string",
			description: "Contact phone number.",
		})
		.option("vat", { type: "string", description: "VAT identifier." })
		.option("zipcode", { type: "string", description: "ZIP or postal code." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating or updating a billing profile.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"account-billing-profile-create-billing-profile">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Billing Profile",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing profiles create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing profiles create",
						method: "POST",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.billing.profiles.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				const result = await withProgress(`Creating`, async () =>
					client.billing.profiles.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
