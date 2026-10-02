import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
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
			"$0 zero-trust dex commands list\n\nRetrieves a paginated list of commands issued to devices under the specified account, optionally filtered by time range, device, or other parameters"
		)
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
			demandOption: true,
		})
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
			demandOption: true,
		})
		.option("from", {
			type: "string",
			description:
				"Start time for the query in ISO (RFC3339 - ISO 8601) format.",
		})
		.option("to", {
			type: "string",
			description: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
		})
		.option("device-id", {
			type: "string",
			description: "Unique identifier for a device.",
		})
		.option("user-email", {
			type: "string",
			description: "Email tied to the device.",
		})
		.option("command-type", {
			type: "string",
			description: "Optionally filter executed commands by command type.",
			choices: ["pcap", "speed-test", "warp-diag"],
		})
		.option("status", {
			type: "string",
			description: "Optionally filter executed commands by status.",
			choices: ["PENDING_EXEC", "PENDING_UPLOAD", "SUCCESS", "FAILED"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get-commands">;
type Query = SdkQuery<"get-commands">;

const typedBuilder = withArgTypes<
	{
		"command-type": Query["command_type"];
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List account commands",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex commands list",
				classification: {
					safeFlags: ["command-type", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					from: argv["from"],
					to: argv["to"],
					device_id: argv["device-id"],
					user_email: argv["user-email"],
					command_type: argv["command-type"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex commands list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/commands`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.dex.commands.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
