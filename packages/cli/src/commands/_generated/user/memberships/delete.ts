import operation from "../../_operations/user/memberships/delete.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
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
			"$0 user memberships delete <membership-id>\n\nRemove the associated member from an account."
		)
		.positional("membership-id", {
			type: "string",
			description: "Membership identifier tag.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <membership-id>",
	describe: "Delete Membership",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user memberships delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user memberships delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/memberships/${argv["membership-id"] == null ? "<membership-id>" : encodeURIComponent(String(argv["membership-id"]))}`,
						pathParams: {
							"membership-id": String(argv["membership-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Are you sure? This action cannot be undone.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, { membership_id: argv["membership-id"] })
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
