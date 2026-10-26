import operation from "../../_operations/dns/domainconnect/get-provider-configuration.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get-provider-configuration command
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
			"$0 dns domainconnect get-provider-configuration <account>\n\nProvides Stratus with extra information about domain connect provider(s)."
		)
		.positional("account", {
			type: "string",
			description: "Account ID.",
			demandOption: true,
		})
		.option("provider", {
			type: "string",
			description: "Provider ID.",
			demandOption: true,
		})
		.option("service", {
			type: "string",
			description: "Service ID.",
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
	command: "get-provider-configuration <account>",
	describe: "Serve a provider configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns domainconnect get-provider-configuration",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns domainconnect get-provider-configuration",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/v2/provconf/${argv["provider"] == null ? "<provider>" : encodeURIComponent(String(argv["provider"]))}/${argv["service"] == null ? "<service>" : encodeURIComponent(String(argv["service"]))}/${argv["account"] == null ? "<account>" : encodeURIComponent(String(argv["account"]))}`,
						pathParams: {
							provider: String(argv["provider"] ?? ""),
							service: String(argv["service"] ?? ""),
							account: String(argv["account"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						provider: argv["provider"],
						service: argv["service"],
						account: argv["account"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
