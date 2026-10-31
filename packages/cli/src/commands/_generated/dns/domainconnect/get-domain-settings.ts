import operation from "../../_operations/dns/domainconnect/get-domain-settings.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get-domain-settings command
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
			"$0 dns domainconnect get-domain-settings <domain>\n\nChecks whether a domain is in Quicksilver and returns its settings."
		)
		.positional("domain", {
			type: "string",
			description: "Domain name.",
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
	command: "get-domain-settings <domain>",
	describe: "Provide settings if domain is served by Cloudflare",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns domainconnect get-domain-settings",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns domainconnect get-domain-settings",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/v2/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}/settings`,
						pathParams: { domain: String(argv["domain"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { domain: argv["domain"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
