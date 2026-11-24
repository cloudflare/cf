import operation from "../../_operations/secrets-store/secrets/list.js";
/**
 * list command
 * @generated from apis/overlays/secrets-store.ts
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
	command: "list",
	describe: "List store secrets",
	usage: "$0 secrets-store secrets list\n\nLists all store secrets.",
	flags: {
		"store-id": { kind: "parsed", brief: "Store identifier.", parse: String },
		direction: {
			kind: "enum",
			brief: "Direction to sort objects.",
			values: ["asc", "desc"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of objects to return per page.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief:
				"Search secrets using a filter string, filtering across name and comment.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Order secrets by values in the given field.",
			values: ["name", "comment", "created", "modified", "status"],
			optional: true,
		},
		scopes: {
			kind: "parsed",
			brief: "Only secrets with the given scopes will be returned.",
			variadic: true,
			optional: true,
			choices: [
				"workers",
				"ai_gateway",
				"dex",
				"access",
				"containers",
				"websearch",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
				command: "secrets-store secrets list",
				classification: {
					safeFlags: ["direction", "order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					order: argv["order"],
					scopes: argv["scopes"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf secrets-store secrets list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secrets_store/stores/${argv["store-id"] == null ? "<store-id>" : encodeURIComponent(String(argv["store-id"]))}/secrets`,
						pathParams: { "store-id": String(argv["store-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						store_id: argv["store-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
