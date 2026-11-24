import operation from "../../_operations/secrets-store/secrets/bulk-delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./bulk-delete.js";
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "secrets-store secrets bulk-delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["ids"] === undefined) {
					throw new Error(
						"--ids is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf secrets-store secrets bulk-delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secrets_store/stores/${argv["store-id"] == null ? "<store-id>" : encodeURIComponent(String(argv["store-id"]))}/secrets`,
					pathParams: { "store-id": String(argv["store-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									ids: argv["ids"],
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
					message: `This operation permanently deletes the specified secrets and cannot be undone.`,
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
						store_id: argv["store-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				ids: argv["ids"],
			});
			const result = await withProgress(`Deleting`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					store_id: argv["store-id"],
				})
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
