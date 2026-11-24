import operation from "../_operations/d1/query.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./query.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "d1 query",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf d1 query",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/query`,
					pathParams: { "database-id": String(argv["database-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									params: argv["params"],
									sql: resolveFileToken(
										argv["sql"] as string | undefined,
										"sql",
										"text"
									),
									batch: parseObjectArray(argv["batch"], "batch"),
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
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						database_id: argv["database-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				params: argv["params"],
				sql: resolveFileToken(argv["sql"] as string | undefined, "sql", "text"),
				batch: parseObjectArray(argv["batch"], "batch"),
			});
			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					database_id: argv["database-id"],
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
