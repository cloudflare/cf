import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dex tests network-path get <test-id>\n\nGet a breakdown of metrics by hop for individual traceroute test runs."
		)
		.positional("test-id", {
			type: "string",
			description: "Unique identifier for a specific test.",
			demandOption: true,
		})
		.option("device-id", {
			type: "string",
			description: "Device to filter traceroute result runs to.",
			demandOption: true,
		})
		.option("from", {
			type: "string",
			description: "Start time for aggregate metrics in ISO ms.",
			demandOption: true,
		})
		.option("to", {
			type: "string",
			description: "End time for aggregate metrics in ISO ms.",
			demandOption: true,
		})
		.option("interval", {
			type: "string",
			description: "Time interval for aggregate time slots.",
			choices: ["minute", "hour"],
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"dex-endpoints-traceroute-test-network-path">;
type Query = SdkQuery<"dex-endpoints-traceroute-test-network-path">;

const typedBuilder = withArgTypes<
	{
		interval: Query["interval"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <test-id>",
	describe: "Get network path breakdown for a traceroute test",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex tests network-path get",
				classification: {
					safeFlags: ["interval", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					deviceId: argv["device-id"],
					from: argv["from"],
					to: argv["to"],
					interval: argv["interval"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex tests network-path get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/traceroute-tests/${argv["test-id"] == null ? "<test-id>" : encodeURIComponent(String(argv["test-id"]))}/network-path`,
						pathParams: { "test-id": String(argv["test-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.dex.tests.networkPath.get({
						account_id: accountId,
						test_id: argv["test-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
