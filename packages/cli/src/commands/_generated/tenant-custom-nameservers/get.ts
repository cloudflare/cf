import operation from "../_operations/tenant-custom-nameservers/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 tenant-custom-nameservers get <tenant-tag>\n\nLists a tenant's custom nameservers."
		)
		.positional("tenant-tag", {
			type: "string",
			description: "Tenant identifier tag.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <tenant-tag>",
	describe: "List Tenant Custom Nameservers",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenant-custom-nameservers get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf tenant-custom-nameservers get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-tag"] == null ? "<tenant-tag>" : encodeURIComponent(String(argv["tenant-tag"]))}/custom_ns`,
						pathParams: { "tenant-tag": String(argv["tenant-tag"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { tenant_tag: argv["tenant-tag"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
