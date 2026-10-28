import operation from "../../../_operations/zero-trust/organization/trust-settings/replace.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * replace command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust organization trust-settings replace\n\nReplaces the trust settings for your Zero Trust organization."
		)
		.option("grant-trust-to-all-accounts-in-org", {
			type: "boolean",
			description:
				"Whether all accounts in the organization are trusted to use this account's cross-account Access resources.",
		})
		.option("trusting-accounts", {
			type: "string",
			array: true,
			description:
				"Explicit account IDs trusted to use this account's cross-account Access resources. At most 100 unique valid account IDs are accepted. Omitted from responses when empty.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "replace",
	describe: "Replace Zero Trust organization trust settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust organization trust-settings replace",
				classification: {
					safeFlags: ["grant-trust-to-all-accounts-in-org", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust organization trust-settings replace",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/organizations/trust_settings`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										grant_trust_to_all_accounts_in_org:
											argv["grant-trust-to-all-accounts-in-org"],
										trusting_accounts: argv["trusting-accounts"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["grant-trust-to-all-accounts-in-org"] === undefined) {
					throw new Error(
						"--grant-trust-to-all-accounts-in-org is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					grant_trust_to_all_accounts_in_org:
						argv["grant-trust-to-all-accounts-in-org"],
					trusting_accounts: argv["trusting-accounts"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
