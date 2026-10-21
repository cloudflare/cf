import operation from "../../_operations/dns/domainconnect/get-provider-template.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get-provider-template command
 * @generated from apis/overlays/dns.ts
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
			"$0 dns domainconnect get-provider-template <service>\n\nProviders are the external parties that are configured to interact with Cloudflare."
		)
		.positional("service", {
			type: "string",
			description: "Service name.",
			demandOption: true,
		})
		.option("provider", {
			type: "string",
			description: "Provider name.",
			demandOption: true,
		})
		.option("dump", { type: "string", description: "Dump raw template." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-provider-template <service>",
	describe: "Serve a provider template",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns domainconnect get-provider-template",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					dump: argv["dump"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns domainconnect get-provider-template",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/v2/domainTemplates/providers/${argv["provider"] == null ? "<provider>" : encodeURIComponent(String(argv["provider"]))}/services/${argv["service"] == null ? "<service>" : encodeURIComponent(String(argv["service"]))}`,
						pathParams: {
							provider: String(argv["provider"] ?? ""),
							service: String(argv["service"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						provider: argv["provider"],
						service: argv["service"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
