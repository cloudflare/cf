import operation from "../../../../../../../_operations/magic-transit/advanced-tcp-protection/configs/tcp/flow/protection/filters/list.js";
/**
 * list command
 * @generated from apis/overlays/magic-transit.ts
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
	describe: "List all TCP Flow Protection filters.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection filters list\n\nList all TCP Flow Protection filters for an account.",
	flags: {
		"filter-mode": {
			kind: "parsed",
			brief:
				"The mode of the filters to get. Optional. Valid values: 'enabled', 'disabled', 'monitoring'.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "The page number for pagination. Defaults to 1.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"The number of items per page. Must be between 10 and 1000. Defaults to 25.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "parsed",
			brief: "The field to order by. Defaults to 'prefix'.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "parsed",
			brief: "The direction of ordering (ASC or DESC). Defaults to 'ASC'.",
			optional: true,
			parse: String,
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
				command:
					"magic-transit advanced-tcp-protection configs tcp flow protection filters list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					mode: argv["filter-mode"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs tcp flow protection filters list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/tcp_flow_protection/filters`,
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
