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
 * updateEmail command
 * @generated from apis/overlays/billing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 billing profiles updateEmail\n\nUpdates the billing email addresses and preferred locale for an account."
		)
		.option("billing-email", {
			type: "string",
			description: "The billing_email field",
		})
		.option("preferred-locale", {
			type: "string",
			description: "The preferred_locale field",
		})
		.option("secondary-billing-email", {
			type: "string",
			description: "The secondary_billing_email field",
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

type Request = SdkRequest<"account-billing-profile-update-billing-email">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "updateEmail",
	describe: "Update Billing Email",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing profiles updateEmail",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing profiles updateEmail",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billing/profile`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										billing_email: resolveFileToken(
											argv["billing-email"] as string | undefined,
											"billing-email",
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.billing.profiles.updateEmail({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					billing_email: resolveFileToken(
						argv["billing-email"] as string | undefined,
						"billing-email",
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.billing.profiles.updateEmail({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
