import operation from "../../_operations/resource-sharing/recipients/create.js";
/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
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
	command: "create <share-id>",
	describe: "Trigger a recipient addition to a share",
	usage:
		"$0 resource-sharing recipients create <share-id>\n\nAdds a single recipient to an account-targeted resource share, granting them access to the shared resources. The recipient account must belong to the same organization as the share owner. To replace the entire recipient list in one call, use `PUT /accounts/{account_id}/shares/{share_id}/recipients` instead.",
	flags: {
		"recipient-account-id": {
			kind: "parsed",
			brief: "The account that will receive the share.",
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
			brief:
				"Specify the account receiving the share using `recipient_account_id`. The legacy field `account_id` is accepted as a synonym during the deprecation period (see `x-sunset` on that field). ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing recipients create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing recipients create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/recipients`,
						pathParams: { "share-id": String(argv["share-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										recipient_account_id: resolveFileToken(
											argv["recipient-account-id"] as string | undefined,
											"recipient-account-id",
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							share_id: argv["share-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					recipient_account_id: resolveFileToken(
						argv["recipient-account-id"] as string | undefined,
						"recipient-account-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						share_id: argv["share-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
