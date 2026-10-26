import operation from "../../../_operations/flagship/apps/flags/evaluate.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * evaluate command
 * @generated from apis/overlays/flagship.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 flagship apps flags evaluate <app-id>\n\nEvaluates a flag against the provided context, passed as a JSON request body (OFREP-shaped) rather than query parameters. Returns the same response shape as the GET variant."
		)
		.positional("app-id", {
			type: "string",
			description: "Flagship app ID returned when the app was created.",
			demandOption: true,
		})
		.option("context", {
			type: "string",
			description:
				"Evaluation attributes keyed by name. Values may be any JSON value; the context supports up to 100 entries, nesting depth of 10, 10,000 values, and 32 KB. Provide as a JSON object or @path/to/file.json.",
		})
		.option("flag-key", {
			type: "string",
			description: "Key of the flag to evaluate within the app.",
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
	command: "evaluate <app-id>",
	describe: "Evaluate flag with JSON context",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags evaluate",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf flagship apps flags evaluate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/evaluate`,
						pathParams: { "app-id": String(argv["app-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											context: parseJsonMap(argv["context"], "context"),
											flagKey: resolveFileToken(
												argv["flag-key"] as string | undefined,
												"flag-key",
												"text"
											),
										},
										[["context"]]
									),
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
							app_id: argv["app-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["flag-key"] === undefined) {
					argv["flag-key"] = await promptForRequiredField(
						"flag-key",
						"Key of the flag to evaluate within the app."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						context: parseJsonMap(argv["context"], "context"),
						flagKey: resolveFileToken(
							argv["flag-key"] as string | undefined,
							"flag-key",
							"text"
						),
					},
					[["context"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
