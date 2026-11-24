import operation from "../../_operations/billing/profiles/update-email.js";
/**
 * update-email command
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
	command: "update-email",
	describe: "Update Billing Email",
	usage:
		"$0 billing profiles update-email\n\nUpdates the billing email addresses and preferred locale for an account.",
	flags: {
		"billing-email": {
			kind: "parsed",
			brief: "The billing_email field",
			optional: true,
			parse: String,
		},
		"preferred-locale": {
			kind: "parsed",
			brief: "The preferred_locale field",
			optional: true,
			parse: String,
		},
		"secondary-billing-email": {
			kind: "parsed",
			brief: "The secondary_billing_email field",
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
				command: "billing profiles update-email",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing profiles update-email",
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
