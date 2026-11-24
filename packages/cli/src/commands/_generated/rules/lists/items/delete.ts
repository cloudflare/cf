import operation from "../../../_operations/rules/lists/items/delete.js";
/**
 * delete command
 * @generated from apis/overlays/rules.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <list-id>",
	describe: "Delete list items",
	usage:
		"$0 rules lists items delete <list-id>\n\nRemoves one or more items from a list. This operation is asynchronous. To get the current operation status, invoke the `Get bulk operation status` endpoint with the returned `operation_id`. There is a limit of 1 pending bulk operation per account. If an outstanding bulk operation is in progress, the request will be rejected.",
	flags: {
		items: {
			kind: "parsed",
			brief:
				'The list items to delete, identified by their unique IDs. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "list-id",
			brief: "The unique ID of the list.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rules lists items delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rules lists items delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rules/lists/${argv["list-id"] == null ? "<list-id>" : encodeURIComponent(String(argv["list-id"]))}/items`,
						pathParams: { "list-id": String(argv["list-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										items: parseObjectArray(argv["items"], "items"),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation deletes the selected items from the custom list.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Deleting`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							list_id: argv["list-id"],
						})
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					items: parseObjectArray(argv["items"], "items"),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						list_id: argv["list-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
