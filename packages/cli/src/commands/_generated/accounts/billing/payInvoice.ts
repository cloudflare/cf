import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * payInvoice command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts billing payInvoice\n\nPays an outstanding invoice for an account. Returns a Stripe client secret when Strong Customer Authentication (SCA) is required to complete the payment."
		)
		.option("invoice-id", {
			type: "string",
			description: "The identifier of the invoice to pay.",
		})
		.option("payment-method-id", {
			type: "string",
			description:
				"The payment method to use. If omitted, the default payment method is used.",
		})
		.option("validate-payment-method", {
			type: "boolean",
			description: "Whether to validate the payment method before processing.",
		})
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

type Request = SdkRequest<"account-billing-pay-invoice">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "payInvoice",
	describe: "Pay Invoice",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts billing payInvoice",
				classification: {
					safeFlags: ["validate-payment-method", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts billing payInvoice",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.accounts.billing.payInvoice({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.accounts.billing.payInvoice({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
