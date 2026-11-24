import operation from "../../../_operations/accounts/billing/payment-methods/create.js";
/**
 * create command
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
	command: "create",
	describe: "Create Payment Method",
	usage:
		"$0 accounts billing payment-methods create\n\nCreates a new payment method for an account.",
	flags: {
		address: {
			kind: "parsed",
			brief: "Billing address line 1.",
			optional: true,
			parse: String,
		},
		address2: {
			kind: "parsed",
			brief: "Billing address line 2.",
			optional: true,
			parse: String,
		},
		"bank-account-type": {
			kind: "parsed",
			brief: "Bank account type.",
			optional: true,
			parse: String,
		},
		"bank-code": {
			kind: "parsed",
			brief: "Bank code.",
			optional: true,
			parse: String,
		},
		"bank-country": {
			kind: "parsed",
			brief: "Bank country.",
			optional: true,
			parse: String,
		},
		"bank-name": {
			kind: "parsed",
			brief: "Bank name for bank-based payment methods.",
			optional: true,
			parse: String,
		},
		"bank-routing-number": {
			kind: "parsed",
			brief: "Bank routing number.",
			optional: true,
			parse: String,
		},
		"cashapp-cash-tag": {
			kind: "parsed",
			brief: "Cash App cash tag.",
			optional: true,
			parse: String,
		},
		city: {
			kind: "parsed",
			brief: "Billing city.",
			optional: true,
			parse: String,
		},
		country: {
			kind: "parsed",
			brief: "Billing country.",
			optional: true,
			parse: String,
		},
		default: {
			kind: "boolean",
			brief: "Whether this is the default payment method.",
			optional: true,
		},
		"device-data": {
			kind: "parsed",
			brief: "Device data for fraud prevention.",
			optional: true,
			parse: String,
		},
		"first-name": {
			kind: "parsed",
			brief: "Billing first name.",
			optional: true,
			parse: String,
		},
		"last-name": {
			kind: "parsed",
			brief: "Billing last name.",
			optional: true,
			parse: String,
		},
		"nick-name": {
			kind: "parsed",
			brief: "A nickname for the payment method.",
			optional: true,
			parse: String,
		},
		"payment-account-email": {
			kind: "parsed",
			brief: "Email associated with the payment account.",
			optional: true,
			parse: String,
		},
		"payment-email": {
			kind: "parsed",
			brief: "Payment email address.",
			optional: true,
			parse: String,
		},
		"payment-gateway": {
			kind: "parsed",
			brief: "The payment gateway used.",
			optional: true,
			parse: String,
		},
		"payment-nonce": {
			kind: "parsed",
			brief: "Payment nonce for tokenized payments.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "Billing state.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The payment method type.",
			optional: true,
			choices: [
				"CREDIT_CARD",
				"PAYPAL",
				"CASHAPP",
				"SEPA_DEBIT",
				"LINK",
				"ACH_DIRECT_DEBIT",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		zipcode: {
			kind: "parsed",
			brief: "Billing zip code.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
		),
});

export default command;
