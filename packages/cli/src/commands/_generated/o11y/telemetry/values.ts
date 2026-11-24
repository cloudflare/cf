import operation from "../../_operations/o11y/telemetry/values.js";
/**
 * values command
 * @generated from apis/overlays/o11y.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "values",
	describe: "List values",
	usage: "$0 o11y telemetry values\n\nList unique values found in your events.",
	flags: {
		datasets: {
			kind: "parsed",
			brief: "Leave this empty to use the default datasets",
			variadic: true,
			optional: true,
			parse: String,
		},
		filters: {
			kind: "parsed",
			brief:
				'Apply filters before listing values. Supports nested groups via kind: \'group\'. Maximum nesting depth is 4. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"filterCombination": "and" | "or" | "AND" | ...more, "filters": [{...}], "kind": "group"} | ...more)].',
			optional: true,
			parse: String,
		},
		key: {
			kind: "parsed",
			brief: "The key field",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "The limit field",
			default: "50",
			parse: Number,
		},
		"needle-is-regex": {
			kind: "boolean",
			brief:
				"When true, treats the value as a regular expression (RE2 syntax).",
			optional: true,
		},
		"needle-match-case": {
			kind: "boolean",
			brief:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
			optional: true,
		},
		"timeframe-from": {
			kind: "parsed",
			brief: "The timeframe.from field",
			optional: true,
			parse: Number,
		},
		"timeframe-to": {
			kind: "parsed",
			brief: "The timeframe.to field",
			optional: true,
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			choices: ["string", "boolean", "number"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Retrieve values from your telemetry events.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y telemetry values",
				classification: {
					safeFlags: [
						"needle-is-regex",
						"needle-match-case",
						"type",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["datasets"] === undefined) {
						throw new Error(
							"--datasets is required (or pass --body with this field set)."
						);
					}
					if (argv["key"] === undefined) {
						argv["key"] = await promptForRequiredField("key", "The key field");
					}
					if (argv["timeframe-from"] === undefined) {
						throw new Error(
							"--timeframe-from is required (or pass --body with this field set)."
						);
					}
					if (argv["timeframe-to"] === undefined) {
						throw new Error(
							"--timeframe-to is required (or pass --body with this field set)."
						);
					}
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredEnumField(
							"type",
							"The type field",
							["string", "boolean", "number"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y telemetry values",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/telemetry/values`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										datasets: argv["datasets"],
										filters: parseObjectArray(argv["filters"], "filters"),
										key: resolveFileToken(
											argv["key"] as string | undefined,
											"key",
											"text"
										),
										limit: argv["limit"],
										needle: {
											isRegex: argv["needle-is-regex"],
											matchCase: argv["needle-match-case"],
										},
										timeframe: {
											from: argv["timeframe-from"],
											to: argv["timeframe-to"],
										},
										type: argv["type"],
									}),
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					datasets: argv["datasets"],
					filters: parseObjectArray(argv["filters"], "filters"),
					key: resolveFileToken(
						argv["key"] as string | undefined,
						"key",
						"text"
					),
					limit: argv["limit"],
					needle: {
						isRegex: argv["needle-is-regex"],
						matchCase: argv["needle-match-case"],
					},
					timeframe: {
						from: argv["timeframe-from"],
						to: argv["timeframe-to"],
					},
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
