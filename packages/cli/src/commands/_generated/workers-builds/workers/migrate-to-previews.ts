import operation from "../../_operations/workers-builds/workers/migrate-to-previews.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * migrate-to-previews command
 * @generated from apis/overlays/workers-builds.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-builds workers migrate-to-previews <script-tag>\n\nMigrate a Worker's legacy non-production trigger to Previews. The legacy build settings become the Previews base config and the legacy trigger is removed."
		)
		.positional("script-tag", {
			type: "string",
			description: "The Worker script tag (external script ID)",
			demandOption: true,
		})
		.option("deploy-command", {
			type: "string",
			description:
				"Deploy command for the migrated Preview settings. Omit it to have the existing 'wrangler versions upload' command rewritten to 'wrangler preview' automatically, which fails with 400 when the existing command cannot be rewritten.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for migrating a Worker's legacy non-production trigger to Previews.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "migrate-to-previews <script-tag>",
	describe: "Migrate worker to previews",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers-builds workers migrate-to-previews",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers-builds workers migrate-to-previews",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["script-tag"] == null ? "<script-tag>" : encodeURIComponent(String(argv["script-tag"]))}/migrate_to_previews`,
						pathParams: { "script-tag": String(argv["script-tag"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										deploy_command: resolveFileToken(
											argv["deploy-command"] as string | undefined,
											"deploy-command",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							script_tag: argv["script-tag"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					deploy_command: resolveFileToken(
						argv["deploy-command"] as string | undefined,
						"deploy-command",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						script_tag: argv["script-tag"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
