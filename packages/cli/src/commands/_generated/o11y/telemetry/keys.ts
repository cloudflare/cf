import operation from "../../_operations/o11y/telemetry/keys.js";
/**
 * keys command
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "keys",
	describe: "List keys",
	usage:
		"$0 o11y telemetry keys\n\nList all the keys in your telemetry events.",
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
				'Apply filters to narrow key discovery. Supports nested groups via kind: \'group\'. Maximum nesting depth is 4. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"filterCombination": "and" | "or" | "AND" | ...more, "filters": [{...}], "kind": "group"} | ...more)].',
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief: "The from field",
			optional: true,
			parse: Number,
		},
		"key-needle-is-regex": {
			kind: "boolean",
			brief:
				"When true, treats the value as a regular expression (RE2 syntax).",
			optional: true,
		},
		"key-needle-match-case": {
			kind: "boolean",
			brief:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
			optional: true,
		},
		limit: {
			kind: "parsed",
			brief:
				"Advanced usage: set limit=1000+ to retrieve comprehensive key options without needing additional filtering.",
			optional: true,
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
		to: {
			kind: "parsed",
			brief: "The to field",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Find keys in your telemetry events matching a specific filter or needle.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y telemetry keys",
				classification: {
					safeFlags: [
						"key-needle-is-regex",
						"key-needle-match-case",
						"needle-is-regex",
						"needle-match-case",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y telemetry keys",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/telemetry/keys`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										datasets: argv["datasets"],
										filters: parseObjectArray(argv["filters"], "filters"),
										from: argv["from"],
										keyNeedle: {
											isRegex: argv["key-needle-is-regex"],
											matchCase: argv["key-needle-match-case"],
										},
										limit: argv["limit"],
										needle: {
											isRegex: argv["needle-is-regex"],
											matchCase: argv["needle-match-case"],
										},
										to: argv["to"],
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
					datasets: argv["datasets"],
					filters: parseObjectArray(argv["filters"], "filters"),
					from: argv["from"],
					keyNeedle: {
						isRegex: argv["key-needle-is-regex"],
						matchCase: argv["key-needle-match-case"],
					},
					limit: argv["limit"],
					needle: {
						isRegex: argv["needle-is-regex"],
						matchCase: argv["needle-match-case"],
					},
					to: argv["to"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
