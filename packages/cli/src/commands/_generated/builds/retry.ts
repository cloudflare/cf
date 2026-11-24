/**
 * retry command
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
	command: "retry <build-uuid>",
	describe: "Retry a Worker build",
	usage:
		"$0 builds retry <build-uuid>\n\nStart a new build from the branch and commit of a stopped build.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Script tag of the Worker.",
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
			placeholder: "build-uuid",
			brief: "UUID of the build, as returned by builds list.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds retry",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds retry",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/builds/${argv["build-uuid"] == null ? "<build-uuid>" : encodeURIComponent(String(argv["build-uuid"]))}/retry`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							"build-uuid": String(argv["build-uuid"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/builds/${encodeURIComponent(String(argv["build-uuid"]))}/retry`
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
