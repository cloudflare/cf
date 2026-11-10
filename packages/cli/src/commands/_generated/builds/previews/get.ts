import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds previews get <preview>\n\nRetrieve a single Preview of a Worker, including the build settings it currently uses."
		)
		.positional("preview", {
			type: "string",
			description: "ID of the Preview.",
			demandOption: true,
		})
		.option("worker", {
			type: "string",
			description: "Script tag of the Worker.",
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
	command: "get <preview>",
	describe: "Get preview",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds previews get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds previews get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/previews/${argv["preview"] == null ? "<preview>" : encodeURIComponent(String(argv["preview"]))}`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							preview: String(argv["preview"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["preview"]))}`
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
