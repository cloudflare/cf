import operation from "../../_operations/logpush/transformers/preview.js";
/**
 * preview command
 * @generated from apis/overlays/logpush.ts
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
	command: "preview",
	describe: "Preview transformer",
	usage:
		"$0 logpush transformers preview\n\nExecutes a SQL transformer against a single input record and returns the transformed output. This is a stateless endpoint — nothing is persisted.",
	flags: {
		input: {
			kind: "parsed",
			brief:
				'A single log record to transform (JSON object). Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		sql: {
			kind: "parsed",
			brief:
				"The SQL transformer query. Maximum 32 KB. The query must contain a FROM clause referencing a valid logpush dataset.",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logpush transformers preview",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["input"] === undefined) {
						throw new Error(
							"--input is required (or pass --body with this field set)."
						);
					}
					if (argv["sql"] === undefined) {
						argv["sql"] = await promptForRequiredField(
							"sql",
							"The SQL transformer query. Maximum 32 KB. The query must contain a FROM clause referencing a valid logpush dataset."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf logpush transformers preview",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/logpush/transformers/preview`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [{ path: ["input"], flag: "input" }])
								: compactBody(
										{
											input: parseJsonMap(argv["input"], "input", true),
											sql: resolveFileToken(
												argv["sql"] as string | undefined,
												"sql",
												"text"
											),
										},
										[["input"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? parseBody(argv.body, [{ path: ["input"], flag: "input" }])
						: undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Loading`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						input: parseJsonMap(argv["input"], "input", true),
						sql: resolveFileToken(
							argv["sql"] as string | undefined,
							"sql",
							"text"
						),
					},
					[["input"]]
				);
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
