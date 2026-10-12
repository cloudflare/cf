import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
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
			"$0 tenant-custom-nameservers delete <custom-ns-id>\n\nDeletes a tenant's custom nameserver."
		)
		.positional("custom-ns-id", {
			type: "string",
			description: "The FQDN of the name server.",
			demandOption: true,
		})
		.option("tenant-tag", {
			type: "string",
			description: "Tenant identifier tag.",
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
	SdkRequest<"tenant-level-custom-nameservers-delete-tenant-custom-nameserver">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <custom-ns-id>",
	describe: "Delete Tenant Custom Nameserver",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenant-custom-nameservers delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf tenant-custom-nameservers delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-tag"] == null ? "<tenant-tag>" : encodeURIComponent(String(argv["tenant-tag"]))}/custom_ns/${argv["custom-ns-id"] == null ? "<custom-ns-id>" : encodeURIComponent(String(argv["custom-ns-id"]))}`,
						pathParams: {
							"custom-ns-id": String(argv["custom-ns-id"] ?? ""),
							"tenant-tag": String(argv["tenant-tag"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.tenantCustomNameservers.delete({
						tenant_tag: argv["tenant-tag"],
						custom_ns_id: argv["custom-ns-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
