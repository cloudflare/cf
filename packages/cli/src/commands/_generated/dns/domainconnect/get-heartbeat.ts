import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get-heartbeat command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns domainconnect get-heartbeat\n\nUsed by Kubernetes readiness and liveness probes, and CI builder by executing test/staging.sh."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-heartbeat",
	describe: "Heartbeat response",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns domainconnect get-heartbeat",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns domainconnect get-heartbeat",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/_heartbeat`,
						pathParams: {},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const __cfRawBytes = await withProgress(`Loading`, async () =>
					fetchRawBytes(`/_heartbeat`, {
						method: "GET",
						local: argv.local === true,
						persistTo: argv.persistTo as string | undefined,
					})
				);
				writeRawOutput(__cfRawBytes.toString("utf-8"));
				return;
			}
		),
};

export default command;
