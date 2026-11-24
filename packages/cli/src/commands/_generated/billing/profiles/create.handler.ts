import operation from "../../_operations/billing/profiles/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "billing profiles create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
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
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
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
				vat: resolveFileToken(argv["vat"] as string | undefined, "vat", "text"),
				zipcode: resolveFileToken(
					argv["zipcode"] as string | undefined,
					"zipcode",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
