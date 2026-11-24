import operation from "../_operations/basin-catalog/disable.js";
/**
 * disable command
 * @generated from apis/overlays/basin-catalog.ts
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "disable <bucket-name>",
	describe: "Disable Basin Catalog",
	usage:
		"$0 basin-catalog disable <bucket-name>\n\nDisable an R2 bucket as a catalog. This operation deactivates the catalog but preserves existing metadata and data files. The catalog can be re-enabled later.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "bucket-name",
			brief: "Specifies the R2 bucket name to disable as catalog.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog disable",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog disable",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/disable`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation turns off the data catalog for the bucket. Existing namespace or table state remains, but writes stop.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						account_id: accountId,
						bucket_name: argv["bucket-name"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
});

export default command;
