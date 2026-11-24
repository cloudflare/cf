import operation from "../../_operations/workers/versions/get.js";
/**
 * get command
 * @generated from apis/overlays/workers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <version-id>",
	describe: "Get Worker Version",
	usage:
		"$0 workers versions get <version-id>\n\nGet details about a specific Worker version.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifier for the Worker, which can be ID or name.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		include: {
			kind: "enum",
			brief:
				"Optional properties to include in the response. `modules` includes the `modules` property, which contains code and may add several megabytes to the response size. `modules,sourcemaps` also includes the version's source maps in `modules`.",
			values: ["modules", "modules,sourcemaps"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "version-id",
			brief:
				'Identifier for the version, which can be a UUID, a UUID prefix (minimum length 8), or the literal "latest" to operate on the most recently created version.',
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers versions get",
				classification: {
					safeFlags: ["include", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const scriptName = await getWorkerName({
					scriptName: argv["worker"],
					quiet: argv["quiet"] as boolean | undefined,
				});
				argv["worker"] = scriptName;

				const queryParams: Record<string, unknown> = {
					include: argv["include"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers versions get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/workers/${encodeURIComponent(scriptName)}/versions/${argv["version-id"] == null ? "<version-id>" : encodeURIComponent(String(argv["version-id"]))}`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							"version-id": String(argv["version-id"] ?? ""),
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
						worker_id: scriptName,
						version_id: argv["version-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
