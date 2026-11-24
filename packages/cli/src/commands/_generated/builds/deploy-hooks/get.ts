/**
 * get command
 * @generated from apis/overlays/builds.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <deploy-hook-uuid>",
	describe: "Get a deploy hook",
	usage:
		"$0 builds deploy-hooks get <deploy-hook-uuid>\n\nRetrieve the name, branch, Worker identifier, and timestamps for a deploy hook.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Name or script tag of the Worker.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "deploy-hook-uuid",
			brief: "UUID of the deploy hook, as returned by deploy-hooks list.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds deploy-hooks get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds deploy-hooks get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/deploy_hooks/${argv["deploy-hook-uuid"] == null ? "<deploy-hook-uuid>" : encodeURIComponent(String(argv["deploy-hook-uuid"]))}`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							"deploy-hook-uuid": String(argv["deploy-hook-uuid"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/deploy_hooks/${encodeURIComponent(String(argv["deploy-hook-uuid"]))}`
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
