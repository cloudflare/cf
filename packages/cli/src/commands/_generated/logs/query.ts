import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * query command
 * @generated from apis/overlays/logs.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 logs query\n\nRun a SQL query against account or zone-level datasets. Timestamp fields are RFC3339 strings. Filter with: WHERE {timestamp_field} >= now() - INTERVAL '30' DAY WHERE {timestamp_field} >= '2026-04-01T00:00:00Z' WHERE {timestamp_field} BETWEEN '2026-04-01T00:00:00Z' AND '2026-04-30T23:59:59Z' List configured account or zone datasets to see enabled account or zone-level datasets. Zone-level datasets will not appear here. List available account or zone datasets to inspect their schemas and timestamp fields. For more information about the datasets, and the meaning of each field, check out https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/"
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/logs/explorer/query/sql">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "query",
	describe: "Run a log query",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logs query",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf logs query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/logs/explorer/query/sql`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "octet-stream",
						body: argv.body,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/${accountOrZone}/${accountOrZoneId}/logs/explorer/query/sql`,
							{ body: fileContent, headers: { "Content-Type": "text/plain" } }
						)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/${accountOrZone}/${accountOrZoneId}/logs/explorer/query/sql`,
							{ body: bodyData, headers: { "Content-Type": "text/plain" } }
						)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				const result = await withProgress(`Loading`, async () =>
					client.logs.query({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
