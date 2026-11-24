import operation from "../../_operations/ai/models/list.js";
/**
 * list command
 * @generated from apis/overlays/ai.ts
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
	describe: "Model Search",
	usage:
		"$0 ai models list\n\nSearches Workers AI models by name or description.",
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		task: {
			kind: "parsed",
			brief: "Filter by Task Name.",
			optional: true,
			parse: String,
		},
		author: {
			kind: "parsed",
			brief: "Filter by Author.",
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "Filter by Source Id.",
			optional: true,
			parse: Number,
		},
		"hide-experimental": {
			kind: "boolean",
			brief: "Filter to hide experimental models.",
			optional: true,
		},
		search: { kind: "parsed", brief: "Search.", optional: true, parse: String },
		"include-deprecated": {
			kind: "boolean",
			brief:
				"If true, include models for up to three months after their deprecation date. Defaults to false.",
			optional: true,
		},
		format: {
			kind: "enum",
			brief:
				"If set, return models in the requested marketplace format instead of the default response.",
			values: ["openrouter"],
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
				command: "ai models list",
				classification: {
					safeFlags: [
						"hide-experimental",
						"include-deprecated",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					page: argv["page"],
					task: argv["task"],
					author: argv["author"],
					source: argv["source"],
					hide_experimental: argv["hide-experimental"],
					search: argv["search"],
					include_deprecated: argv["include-deprecated"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai models list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai/models/search`,
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
