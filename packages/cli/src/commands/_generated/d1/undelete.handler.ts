import operation from "../_operations/d1/undelete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./undelete.js";
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "d1 undelete",
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
					command: "cf d1 undelete",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/undelete`,
					pathParams: { "database-id": String(argv["database-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									new_name: resolveFileToken(
										argv["new-name"] as string | undefined,
										"new-name",
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

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `After undeleting, Time Travel cannot restore the D1 database to a point in time at or before the undeletion.`,
				}))
			) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						database_id: argv["database-id"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				new_name: resolveFileToken(
					argv["new-name"] as string | undefined,
					"new-name",
					"text"
				),
			});
			const result = await withProgress(`Processing`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					database_id: argv["database-id"],
				})
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
