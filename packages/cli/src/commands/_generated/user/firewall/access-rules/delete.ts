import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 user firewall access-rules delete <rule-id>\n\nDeletes an IP Access rule at the user level. Note: Deleting a user-level rule will affect all zones owned by the user."
		)
		.positional("rule-id", {
			type: "string",
			description: "Unique identifier for a rule.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"ip-access-rules-for-a-user-delete-an-ip-access-rule">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <rule-id>",
	describe: "Delete an IP Access rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user firewall access-rules delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user firewall access-rules delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/user/firewall/access_rules/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation deletes the user-level IP Access Rule and affects every zone owned by the user.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.user.firewall.accessRules.delete({
						rule_id: argv["rule-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
