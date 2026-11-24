import operation from "../../../_operations/cloudforce-one/threat-signals/articles/bulk-mark-read.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./bulk-mark-read.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one threat-signals articles bulk-mark-read",
			classification: {
				safeFlags: ["read", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["article-ids"] === undefined) {
					throw new Error(
						"--article-ids is required (or pass --body with this field set)."
					);
				}
				if (argv["read"] === undefined) {
					throw new Error(
						"--read is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-signals articles bulk-mark-read",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									article_ids: argv["article-ids"],
									read: argv["read"],
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
				article_ids: argv["article-ids"],
				read: argv["read"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
