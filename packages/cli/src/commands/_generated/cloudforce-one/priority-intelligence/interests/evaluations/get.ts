import operation from "../../../../_operations/cloudforce-one/priority-intelligence/interests/evaluations/get.js";
/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "get <evaluation-id>",
	describe: "Get a persisted account-interest evaluation",
	usage:
		"$0 cloudforce-one priority-intelligence interests evaluations get <evaluation-id>\n\nReturns a previously completed live account-interest evaluation by ID. The evaluation must belong to this account.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "evaluation-id", brief: "Evaluation UUID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"cloudforce-one priority-intelligence interests evaluations get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one priority-intelligence interests evaluations get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/interests/evaluations/${argv["evaluation-id"] == null ? "<evaluation-id>" : encodeURIComponent(String(argv["evaluation-id"]))}`,
						pathParams: {
							"evaluation-id": String(argv["evaluation-id"] ?? ""),
						},
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
						evaluation_id: argv["evaluation-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
