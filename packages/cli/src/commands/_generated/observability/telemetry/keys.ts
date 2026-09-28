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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * keys command
 * @generated from apis/overlays/observability.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 observability telemetry keys\n\nList all the keys in your telemetry events."
		)
		.option("datasets", {
			type: "string",
			array: true,
			description: "Leave this empty to use the default datasets",
		})
		.option("filters", {
			type: "string",
			description:
				"Apply filters to narrow key discovery. Supports nested groups via kind: 'group'. Maximum nesting depth is 4. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("from", { type: "number", description: "The from field" })
		.option("key-needle-is-regex", {
			type: "boolean",
			description:
				"When true, treats the value as a regular expression (RE2 syntax).",
		})
		.option("key-needle-match-case", {
			type: "boolean",
			description:
				"When true, performs a case-sensitive search. Defaults to case-insensitive.",
		})
		.option("limit", {
			type: "number",
			description:
				"Advanced usage: set limit=1000+ to retrieve comprehensive key options without needing additional filtering.",
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
		.option("to", { type: "number", description: "The to field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Find keys in your telemetry events matching a specific filter or needle.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"telemetry.keys.list">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "keys",
	describe: "List keys",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "observability telemetry keys",
				classification: {
					safeFlags: [
						"key-needle-is-regex",
						"key-needle-match-case",
						"needle-is-regex",
						"needle-match-case",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf observability telemetry keys",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.observability.telemetry.keys({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.observability.telemetry.keys({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
