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
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts billing payment-methods create\n\nCreates a new payment method for an account."
		)
		.option("address", {
			type: "string",
			description: "Billing address line 1.",
		})
		.option("address2", {
			type: "string",
			description: "Billing address line 2.",
		})
		.option("bank-account-type", {
			type: "string",
			description: "Bank account type.",
		})
		.option("bank-code", { type: "string", description: "Bank code." })
		.option("bank-country", { type: "string", description: "Bank country." })
		.option("bank-name", {
			type: "string",
			description: "Bank name for bank-based payment methods.",
		})
		.option("bank-routing-number", {
			type: "string",
			description: "Bank routing number.",
		})
		.option("cashapp-cash-tag", {
			type: "string",
			description: "Cash App cash tag.",
		})
		.option("city", { type: "string", description: "Billing city." })
		.option("country", { type: "string", description: "Billing country." })
		.option("default", {
			type: "boolean",
			description: "Whether this is the default payment method.",
		})
		.option("device-data", {
			type: "string",
			description: "Device data for fraud prevention.",
		})
		.option("first-name", {
			type: "string",
			description: "Billing first name.",
		})
		.option("last-name", { type: "string", description: "Billing last name." })
		.option("nick-name", {
			type: "string",
			description: "A nickname for the payment method.",
		})
		.option("payment-account-email", {
			type: "string",
			description: "Email associated with the payment account.",
		})
		.option("payment-email", {
			type: "string",
			description: "Payment email address.",
		})
		.option("payment-gateway", {
			type: "string",
			description: "The payment gateway used.",
		})
		.option("payment-nonce", {
			type: "string",
			description: "Payment nonce for tokenized payments.",
		})
		.option("state", { type: "string", description: "Billing state." })
		.option("type", {
			type: "string",
			description: "The payment method type.",
			choices: [
				"CREDIT_CARD",
				"PAYPAL",
				"CASHAPP",
				"SEPA_DEBIT",
				"LINK",
				"ACH_DIRECT_DEBIT",
			],
		})
		.option("zipcode", { type: "string", description: "Billing zip code." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"account-billing-create-payment-method">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Payment Method",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts billing payment-methods create",
				classification: {
					safeFlags: ["default", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
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
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
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
						client.accounts.billing.paymentMethods.create({
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
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
					zipcode: resolveFileToken(
						argv["zipcode"] as string | undefined,
						"zipcode",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.accounts.billing.paymentMethods.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
