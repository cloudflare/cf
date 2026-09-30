import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds list\n\nList paginated build records associated with a Worker tag."
		)
		.option("external-script-id", {
			type: "string",
			description:
				"System-generated tag of the Worker. This is not the Worker name.",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Page number for pagination",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"listBuildsByScript">;
type Query = SdkQuery<"listBuildsByScript">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List builds for a Worker",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["external-script-id"] == null ? "<external-script-id>" : encodeURIComponent(String(argv["external-script-id"]))}/builds`,
						pathParams: {
							"external-script-id": String(argv["external-script-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.builds.list({
						account_id: accountId,
						external_script_id: argv["external-script-id"],
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
