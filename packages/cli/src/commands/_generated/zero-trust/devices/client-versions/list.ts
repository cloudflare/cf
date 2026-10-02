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
			"$0 zero-trust devices client-versions list\n\nLists available WARP client versions for a specific target environment and release track. This endpoint is in Beta."
		)
		.option("target-environment", {
			type: "string",
			description:
				"The target environment for the client version (e.g., windows, macos).",
			demandOption: true,
		})
		.option("release-track", {
			type: "string",
			description:
				"The release track (ga for General Availability, beta for Beta releases).",
			choices: ["ga", "beta"],
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "The page number to return.",
		})
		.option("per-page", {
			type: "number",
			description: "The maximum number of versions to return per page.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"list-client-versions">;
type Query = SdkQuery<"list-client-versions">;

const typedBuilder = withArgTypes<
	{
		"release-track": Query["release_track"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List client versions",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices client-versions list",
				classification: {
					safeFlags: ["release-track", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					target_environment: argv["target-environment"],
					release_track: argv["release-track"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices client-versions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/client-versions`,
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
					client.zeroTrust.devices.clientVersions.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
