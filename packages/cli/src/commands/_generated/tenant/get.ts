import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/tenant.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 tenant get <tenant-id>\n\nRetrieves a tenant's identity, status, metadata, contacts, and organizational units."
		)
		.positional("tenant-id", {
			type: "string",
			description: "The ID of the tenant to retrieve.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"Tenants_retrieveTenant">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <tenant-id>",
	describe: "Get tenant details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenant get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf tenant get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-id"] == null ? "<tenant-id>" : encodeURIComponent(String(argv["tenant-id"]))}`,
						pathParams: { "tenant-id": String(argv["tenant-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.tenant.get({ tenant_id: argv["tenant-id"] } satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
