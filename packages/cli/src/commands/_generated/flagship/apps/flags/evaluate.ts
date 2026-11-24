import operation from "../../../_operations/flagship/apps/flags/evaluate.js";
/**
 * evaluate command
 * @generated from apis/overlays/flagship.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "evaluate <app-id>",
	describe: "Evaluate flag with JSON context",
	usage:
		"$0 flagship apps flags evaluate <app-id>\n\nEvaluates a flag against the provided context, passed as a JSON request body (OFREP-shaped) rather than query parameters. Returns the same response shape as the GET variant.",
	flags: {
		context: {
			kind: "parsed",
			brief:
				'Evaluation attributes keyed by name. Values may be any JSON value; the context supports up to 100 entries, nesting depth of 10, 10,000 values, and 32 KB. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (string | number | boolean | ...more)}.',
			optional: true,
			parse: String,
		},
		"flag-key": {
			kind: "parsed",
			brief: "Key of the flag to evaluate within the app.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "app-id",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags evaluate",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["flag-key"] === undefined) {
						argv["flag-key"] = await promptForRequiredField(
							"flag-key",
							"Key of the flag to evaluate within the app."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
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
				await resolveRequiredFields();

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
});

export default command;
