import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * values command
 * @generated from apis/overlays/o11y.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 o11y telemetry values\n\nList unique values found in your events."
		)
		.option("datasets", {
			type: "string",
			array: true,
			description: "Leave this empty to use the default datasets",
		})
		.option("filters", {
			type: "string",
			description:
				"Apply filters before listing values. Supports nested groups via kind: 'group'. Maximum nesting depth is 4. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("key", { type: "string", description: "The key field" })
		.option("limit", {
			type: "number",
			description: "The limit field",
			default: 50,
		})
		.option("needle-is-regex", {
			type: "boolean",
			description:
				"When true, treats the value as a regular expression (RE2 syntax).",
		})
		.option("needle-match-case", {
			type: "boolean",
			description:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
		})
		.option("timeframe-from", {
			type: "number",
			description: "The timeframe.from field",
		})
		.option("timeframe-to", {
			type: "number",
			description: "The timeframe.to field",
		})
		.option("type", {
			type: "string",
			description: "The type field",
			choices: ["string", "boolean", "number"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Retrieve values from your telemetry events.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"telemetry.values.list">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "values",
	describe: "List values",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.observability.telemetry.values({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.observability.telemetry.values({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
