import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * migrate-to-previews command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds workers migrate-to-previews <worker>\n\nMigrate a Worker's legacy non-production trigger to Previews. The legacy build settings become the Previews base config and the legacy trigger is removed."
		)
		.positional("worker", {
			type: "string",
			description: "Script tag of the Worker.",
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
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
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
	command: "migrate-to-previews <worker>",
	describe: "Migrate worker to previews",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds workers migrate-to-previews",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds workers migrate-to-previews",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/migrate_to_previews`,
						pathParams: { worker: String(argv["worker"] ?? "") },
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation switches the Worker to Previews and removes its legacy non-production trigger. It cannot be reversed.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Processing`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/migrate_to_previews`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Done` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["deploy-command"] !== undefined)
					setNestedValue(
						bodyData,
						["deploy_command"],
						resolveFileToken(
							argv["deploy-command"] as string | undefined,
							"deploy-command",
							"text"
						)
					);
				const result = await withProgress(`Processing`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/migrate_to_previews`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
};

export default command;
