import operation from "../../_operations/accounts/billing/pay-invoice.js";
/**
 * pay-invoice command
 * @generated from apis/overlays/accounts.ts
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
	command: "pay-invoice",
	describe: "Pay Invoice",
	usage:
		"$0 accounts billing pay-invoice\n\nPays an outstanding invoice for an account. Returns a Stripe client secret when Strong Customer Authentication (SCA) is required to complete the payment.",
	flags: {
		"invoice-id": {
			kind: "parsed",
			brief: "The identifier of the invoice to pay.",
			optional: true,
			parse: String,
		},
		"payment-method-id": {
			kind: "parsed",
			brief:
				"The payment method to use. If omitted, the default payment method is used.",
			optional: true,
			parse: String,
		},
		"validate-payment-method": {
			kind: "boolean",
			brief: "Whether to validate the payment method before processing.",
			optional: true,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts billing pay-invoice",
				classification: {
					safeFlags: ["validate-payment-method", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts billing pay-invoice",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pay-invoice`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										invoice_id: resolveFileToken(
											argv["invoice-id"] as string | undefined,
											"invoice-id",
											"text"
										),
										payment_method_id: resolveFileToken(
											argv["payment-method-id"] as string | undefined,
											"payment-method-id",
											"text"
										),
										validate_payment_method: argv["validate-payment-method"],
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
					invoice_id: resolveFileToken(
						argv["invoice-id"] as string | undefined,
						"invoice-id",
						"text"
					),
					payment_method_id: resolveFileToken(
						argv["payment-method-id"] as string | undefined,
						"payment-method-id",
						"text"
					),
					validate_payment_method: argv["validate-payment-method"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
