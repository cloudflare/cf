import operation from "../../../_operations/workers-for-platforms/dispatch-namespaces/scripts/list.js";
/**
 * list command
 * @generated from apis/overlays/workers-for-platforms.ts
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
	describe: "List Workers for Platforms Scripts",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts list\n\nFetch a list of scripts uploaded to a Workers for Platforms dispatch namespace.",
	flags: {
		"dispatch-namespace": {
			kind: "parsed",
			brief: "Name of the Workers for Platforms dispatch namespace.",
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				"Filter scripts by tags. Format: comma-separated list of tag:allowed pairs where allowed is 'yes' or 'no'.",
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
				command: "workers-for-platforms dispatch-namespaces scripts list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					tags: argv["tags"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf workers-for-platforms dispatch-namespaces scripts list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts`,
						pathParams: {
							"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
						},
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
						dispatch_namespace: argv["dispatch-namespace"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
