import operation from "../../../_operations/accounts/billing/payment-methods/create.js";
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
			command: "accounts billing payment-methods create",
			classification: {
				safeFlags: ["default", "type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf accounts billing payment-methods create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/payment-methods`,
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
									bank_account_type: resolveFileToken(
										argv["bank-account-type"] as string | undefined,
										"bank-account-type",
										"text"
									),
									bank_code: resolveFileToken(
										argv["bank-code"] as string | undefined,
										"bank-code",
										"text"
									),
									bank_country: resolveFileToken(
										argv["bank-country"] as string | undefined,
										"bank-country",
										"text"
									),
									bank_name: resolveFileToken(
										argv["bank-name"] as string | undefined,
										"bank-name",
										"text"
									),
									bank_routing_number: resolveFileToken(
										argv["bank-routing-number"] as string | undefined,
										"bank-routing-number",
										"text"
									),
									cashapp_cash_tag: resolveFileToken(
										argv["cashapp-cash-tag"] as string | undefined,
										"cashapp-cash-tag",
										"text"
									),
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
									default: argv["default"],
									device_data: resolveFileToken(
										argv["device-data"] as string | undefined,
										"device-data",
										"text"
									),
									first_name: resolveFileToken(
										argv["first-name"] as string | undefined,
										"first-name",
										"text"
									),
									last_name: resolveFileToken(
										argv["last-name"] as string | undefined,
										"last-name",
										"text"
									),
									nick_name: resolveFileToken(
										argv["nick-name"] as string | undefined,
										"nick-name",
										"text"
									),
									payment_account_email: resolveFileToken(
										argv["payment-account-email"] as string | undefined,
										"payment-account-email",
										"text"
									),
									payment_email: resolveFileToken(
										argv["payment-email"] as string | undefined,
										"payment-email",
										"text"
									),
									payment_gateway: resolveFileToken(
										argv["payment-gateway"] as string | undefined,
										"payment-gateway",
										"text"
									),
									payment_nonce: resolveFileToken(
										argv["payment-nonce"] as string | undefined,
										"payment-nonce",
										"text"
									),
									state: resolveFileToken(
										argv["state"] as string | undefined,
										"state",
										"text"
									),
									type: argv["type"],
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
				bank_account_type: resolveFileToken(
					argv["bank-account-type"] as string | undefined,
					"bank-account-type",
					"text"
				),
				bank_code: resolveFileToken(
					argv["bank-code"] as string | undefined,
					"bank-code",
					"text"
				),
				bank_country: resolveFileToken(
					argv["bank-country"] as string | undefined,
					"bank-country",
					"text"
				),
				bank_name: resolveFileToken(
					argv["bank-name"] as string | undefined,
					"bank-name",
					"text"
				),
				bank_routing_number: resolveFileToken(
					argv["bank-routing-number"] as string | undefined,
					"bank-routing-number",
					"text"
				),
				cashapp_cash_tag: resolveFileToken(
					argv["cashapp-cash-tag"] as string | undefined,
					"cashapp-cash-tag",
					"text"
				),
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
				default: argv["default"],
				device_data: resolveFileToken(
					argv["device-data"] as string | undefined,
					"device-data",
					"text"
				),
				first_name: resolveFileToken(
					argv["first-name"] as string | undefined,
					"first-name",
					"text"
				),
				last_name: resolveFileToken(
					argv["last-name"] as string | undefined,
					"last-name",
					"text"
				),
				nick_name: resolveFileToken(
					argv["nick-name"] as string | undefined,
					"nick-name",
					"text"
				),
				payment_account_email: resolveFileToken(
					argv["payment-account-email"] as string | undefined,
					"payment-account-email",
					"text"
				),
				payment_email: resolveFileToken(
					argv["payment-email"] as string | undefined,
					"payment-email",
					"text"
				),
				payment_gateway: resolveFileToken(
					argv["payment-gateway"] as string | undefined,
					"payment-gateway",
					"text"
				),
				payment_nonce: resolveFileToken(
					argv["payment-nonce"] as string | undefined,
					"payment-nonce",
					"text"
				),
				state: resolveFileToken(
					argv["state"] as string | undefined,
					"state",
					"text"
				),
				type: argv["type"],
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
