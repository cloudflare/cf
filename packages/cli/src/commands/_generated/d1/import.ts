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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * import command
 * @generated from apis/overlays/d1.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 d1 import <database-id>\n\nGenerate a temporary URL for uploading an SQL file to, then instruct the D1 to import it and poll it for status updates. Imports block the D1 for their duration."
		)
		.positional("database-id", {
			type: "string",
			description: "D1 database identifier (UUID).",
			demandOption: true,
		})
		.option("action", {
			type: "string",
			description: "Indicates you have a new SQL file to upload.",
			choices: ["init", "ingest", "poll"],
		})
		.option("etag", {
			type: "string",
			description:
				"Required when action is 'init' or 'ingest'. An md5 hash of the file you're uploading. Used to check if it already exists, and validate its contents before ingesting.",
		})
		.option("filename", {
			type: "string",
			description: "The filename you have successfully uploaded.",
		})
		.option("current-bookmark", {
			type: "string",
			description:
				"This identifies the currently-running import, checking its status.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("etag", ["current-bookmark"])
		.conflicts("filename", ["current-bookmark"])
		.implies("filename", ["etag"])
		.conflicts("current-bookmark", ["etag", "filename"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"d1-import-database">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "import <database-id>",
	describe: "Import SQL into your D1 Database",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 import",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 import",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database/${argv["database-id"] == null ? "<database-id>" : encodeURIComponent(String(argv["database-id"]))}/import`,
						pathParams: { "database-id": String(argv["database-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: resolveFileToken(
											argv["action"] as string | undefined,
											"action",
											"text"
										),
										etag: resolveFileToken(
											argv["etag"] as string | undefined,
											"etag",
											"text"
										),
										filename: resolveFileToken(
											argv["filename"] as string | undefined,
											"filename",
											"text"
										),
										current_bookmark: resolveFileToken(
											argv["current-bookmark"] as string | undefined,
											"current-bookmark",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.d1.import({
							body: bodyData,
							account_id: accountId,
							database_id: argv["database-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"Indicates you have a new SQL file to upload.",
						["init", "ingest", "poll"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					action: resolveFileToken(
						argv["action"] as string | undefined,
						"action",
						"text"
					),
					etag: resolveFileToken(
						argv["etag"] as string | undefined,
						"etag",
						"text"
					),
					filename: resolveFileToken(
						argv["filename"] as string | undefined,
						"filename",
						"text"
					),
					current_bookmark: resolveFileToken(
						argv["current-bookmark"] as string | undefined,
						"current-bookmark",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.d1.import({
						body: bodyData,
						account_id: accountId,
						database_id: argv["database-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
