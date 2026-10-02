import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/organization.ts
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
			"$0 organization member delete <member-id>\n\nDelete a membership to a particular Organization. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.positional("member-id", {
			type: "string",
			description: "Organization Member ID",
			demandOption: true,
		})
		.option("organization-id", {
			type: "string",
			description: "Organization ID",
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

type Request = SdkRequest<"Members_delete">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <member-id>",
	describe: "Delete organization member",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization member delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization member delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/members/${argv["member-id"] == null ? "<member-id>" : encodeURIComponent(String(argv["member-id"]))}`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
							"member-id": String(argv["member-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Delete this organization membership? The member will lose access to this organization and its sub-organizations.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.organization.member.delete({
						organization_id: argv["organization-id"],
						member_id: argv["member-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
