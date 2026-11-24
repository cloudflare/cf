import operation from "../../../_operations/zero-trust/organization/trust-settings/replace.js";
/**
 * replace command
 * @generated from apis/overlays/zero-trust.ts
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "replace",
	describe: "Replace Zero Trust organization trust settings",
	usage:
		"$0 zero-trust organization trust-settings replace\n\nReplaces the trust settings for your Zero Trust organization.",
	flags: {
		"grant-trust-to-all-accounts-in-org": {
			kind: "boolean",
			brief:
				"Whether all accounts in the organization are trusted to use this account's cross-account Access resources.",
			optional: true,
		},
		"trusting-accounts": {
			kind: "parsed",
			brief:
				"Explicit account IDs trusted to use this account's cross-account Access resources. At most 100 unique valid account IDs are accepted. Omitted from responses when empty.",
			variadic: true,
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
				command: "zero-trust organization trust-settings replace",
				classification: {
					safeFlags: ["grant-trust-to-all-accounts-in-org", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["grant-trust-to-all-accounts-in-org"] === undefined) {
						throw new Error(
							"--grant-trust-to-all-accounts-in-org is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
				await resolveRequiredFields();

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
});

export default command;
