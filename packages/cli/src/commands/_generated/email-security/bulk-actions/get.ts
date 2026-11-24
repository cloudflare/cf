import operation from "../../_operations/email-security/bulk-actions/get.js";
/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
	command: "get <job-id>",
	describe: "Get bulk action job details",
	usage:
		"$0 email-security bulk-actions get <job-id>\n\nReturns the status and details of a specific bulk action job.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "job-id",
			brief: "Identifier of the bulk action job.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security bulk-actions get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security bulk-actions get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/bulk/${argv["job-id"] == null ? "<job-id>" : encodeURIComponent(String(argv["job-id"]))}`,
						pathParams: { "job-id": String(argv["job-id"] ?? "") },
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
						job_id: argv["job-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
