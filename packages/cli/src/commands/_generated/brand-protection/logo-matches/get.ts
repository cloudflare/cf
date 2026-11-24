import operation from "../../_operations/brand-protection/logo-matches/get.js";
/**
 * get command
 * @generated from apis/overlays/brand-protection.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get",
	describe: "List logo matches",
	usage:
		"$0 brand-protection logo-matches get\n\nLists images that matched a saved logo query, most recently matched first by default. Set `download=true` to include each matched image as base64 data.",
	flags: {
		offset: {
			kind: "parsed",
			brief: "Number of matches to skip, for pagination. Defaults to 0.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of matches to return. Defaults to 50.",
			optional: true,
			parse: String,
		},
		"query-id": {
			kind: "parsed",
			brief: "ID of the logo query whose matches to list.",
			parse: String,
		},
		download: {
			kind: "parsed",
			brief:
				"Set to `true` to include each matched image as base64 data in `image_data`, with its MIME type in `content_type`.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to sort by: `matchedAt`, `domain`, `similarityScore`, or `registrar`. Defaults to `matchedAt`.",
			values: ["matchedAt", "domain", "similarityScore", "registrar"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Sort direction: `asc` or `desc`. Defaults to `desc`.",
			values: ["asc", "desc"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "brand-protection logo-matches get",
				classification: {
					safeFlags: ["order-by", "order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					offset: argv["offset"],
					limit: argv["limit"],
					query_id: argv["query-id"],
					download: argv["download"],
					orderBy: argv["order-by"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection logo-matches get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/logo/matches`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
