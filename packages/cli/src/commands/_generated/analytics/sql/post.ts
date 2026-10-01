import { createCommandClient, requestApi } from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * post command
 * @generated from apis/overlays/analytics.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 analytics sql post\n\nExecutes a SQL query against the analytics datasets available to the caller. Send either raw SQL or a JSON object containing the query and optional positional or named parameters, time range, and account or zone scope. Raw SQL placeholders can also be bound with query parameters named `param_<name>`. A trailing `FORMAT JSON`, `FORMAT JSONEachRow`, `FORMAT TabSeparated`, or `FORMAT TSV` is supported for all datasets. Without FORMAT, each backend retains its existing default JSON response."
		)
		.option("query", {
			type: "string",
			description:
				"SQL query to execute. A trailing FORMAT selects JSON, JSONEachRow, TabSeparated, or TSV output on any dataset.\n",
		})
		.option("scope-account-tag", {
			type: "string",
			description:
				"Account tag used to authorize and scope the query. Must be a 32-character lowercase hex string.\n",
		})
		.option("scope-zone-tag", {
			type: "string",
			description:
				"Zone tag used to authorize and scope the query. Must be a 32-character lowercase hex string.\n",
		})
		.option("time-range-end", {
			type: "string",
			description: "Inclusive upper bound for the dataset's timestamp column.",
		})
		.option("time-range-start", {
			type: "string",
			description: "Inclusive lower bound for the dataset's timestamp column.",
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
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		})
		.conflicts("scope-account-tag", ["scope-zone-tag"])
		.conflicts("scope-zone-tag", ["scope-account-tag"])
		.check((argv) => {
			const groupSet = ["time-range-end", "time-range-start"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["time-range-start"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --time_range-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "post",
	describe: "Query analytics datasets",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "analytics sql post",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf analytics sql post",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/analytics/sql`,
						pathParams: {},
						bodyKind: argv.file !== undefined ? "octet-stream" : "json",
						body:
							argv.file !== undefined
								? { file: argv.file }
								: argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											query: resolveFileToken(
												argv["query"] as string | undefined,
												"query",
												"text"
											),
											scope: {
												accountTag: resolveFileToken(
													argv["scope-account-tag"] as string | undefined,
													"scope-account-tag",
													"text"
												),
												zoneTag: resolveFileToken(
													argv["scope-zone-tag"] as string | undefined,
													"scope-zone-tag",
													"text"
												),
											},
											time_range: {
												end: resolveFileToken(
													argv["time-range-end"] as string | undefined,
													"time-range-end",
													"text"
												),
												start: resolveFileToken(
													argv["time-range-start"] as string | undefined,
													"time-range-start",
													"text"
												),
											},
										}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(client, "POST", `/analytics/sql`, {
							body: fileContent,
							headers: { "Content-Type": "text/plain" },
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(client, "POST", `/analytics/sql`, {
							body: bodyData,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["query"] === undefined) {
					argv["query"] = await promptForRequiredField(
						"query",
						"SQL query to execute. A trailing FORMAT selects JSON, JSONEachRow, TabSeparated, or TSV output on any dataset. "
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["query"] !== undefined)
					setNestedValue(
						bodyData,
						["query"],
						resolveFileToken(
							argv["query"] as string | undefined,
							"query",
							"text"
						)
					);
				if (argv["scope-account-tag"] !== undefined)
					setNestedValue(
						bodyData,
						["scope", "accountTag"],
						resolveFileToken(
							argv["scope-account-tag"] as string | undefined,
							"scope-account-tag",
							"text"
						)
					);
				if (argv["scope-zone-tag"] !== undefined)
					setNestedValue(
						bodyData,
						["scope", "zoneTag"],
						resolveFileToken(
							argv["scope-zone-tag"] as string | undefined,
							"scope-zone-tag",
							"text"
						)
					);
				if (argv["time-range-end"] !== undefined)
					setNestedValue(
						bodyData,
						["time_range", "end"],
						resolveFileToken(
							argv["time-range-end"] as string | undefined,
							"time-range-end",
							"text"
						)
					);
				if (argv["time-range-start"] !== undefined)
					setNestedValue(
						bodyData,
						["time_range", "start"],
						resolveFileToken(
							argv["time-range-start"] as string | undefined,
							"time-range-start",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(client, "POST", `/analytics/sql`, {
						body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
