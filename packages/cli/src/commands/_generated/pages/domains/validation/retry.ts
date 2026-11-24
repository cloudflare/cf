import operation from "../../../_operations/pages/domains/validation/retry.js";
/**
 * retry command
 * @generated from apis/overlays/pages.ts
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
	command: "retry <domain-name>",
	describe: "Retry custom domain validation",
	usage:
		"$0 pages domains validation retry <domain-name>\n\nRetry validation for a custom domain attached to a Cloudflare Pages project.",
	flags: {
		"project-name": {
			kind: "parsed",
			brief:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
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
			placeholder: "domain-name",
			brief:
				"Fully qualified domain name for the Pages project, such as \`example.com\`.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages domains validation retry",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pages domains validation retry",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}/domains/${argv["domain-name"] == null ? "<domain-name>" : encodeURIComponent(String(argv["domain-name"]))}`,
						pathParams: {
							"project-name": String(argv["project-name"] ?? ""),
							"domain-name": String(argv["domain-name"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						account_id: accountId,
						project_name: argv["project-name"],
						domain_name: argv["domain-name"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
