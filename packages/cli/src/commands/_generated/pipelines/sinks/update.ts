import operation from "../../_operations/pipelines/sinks/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/pipelines.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pipelines sinks update <sink-id>\n\nUpdate a Sink's credentials or rolling policy, creating a new version of the Sink. Only `credentials` and `rolling_policy` (R2) or `token` and `rolling_policy` (Basin Catalog, including Sinks created with the legacy `r2_data_catalog` type) can be changed; omitted fields keep their current values. Secrets are never returned in responses. Pipelines that use the Sink keep their current version until they are moved to the latest one with Update Pipeline Tables."
		)
		.positional("sink-id", {
			type: "string",
			description: "Specifies the publid ID of the sink.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <sink-id>",
	describe: "Update Sink",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pipelines sinks update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pipelines sinks update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/sinks/${argv["sink-id"] == null ? "<sink-id>" : encodeURIComponent(String(argv["sink-id"]))}`,
						pathParams: { "sink-id": String(argv["sink-id"] ?? "") },
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							sink_id: argv["sink-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
			}
		),
};

export default command;
