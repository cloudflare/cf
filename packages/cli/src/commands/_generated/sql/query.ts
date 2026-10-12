import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * query command
 * @generated from apis/overlays/sql.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, requestApi } from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 sql query <query>\n\nExecutes a SQL query against the analytics datasets available to the caller. Send either raw SQL or a JSON object containing the query and optional positional or named parameters, time range, and account or zone scope. Raw SQL placeholders can also be bound with query parameters named `param_<name>`. A trailing `FORMAT JSON`, `FORMAT JSONEachRow`, `FORMAT TabSeparated`, or `FORMAT TSV` is supported for all datasets. Without FORMAT, each backend retains its existing default JSON response."
		)
		.positional("query", {
			type: "string",
			description:
				"SQL query to execute. A trailing FORMAT selects JSON, JSONEachRow, TabSeparated, or TSV output on any dataset. ",
			demandOption: true,
		})
		.option("scope-account", {
			type: "string",
			description:
				"Account tag used to authorize and scope the query. Must be a 32-character lowercase hex string.\n",
		})
		.option("scope-zone", {
			type: "string",
			description:
				"Zone tag used to authorize and scope the query. Must be a 32-character lowercase hex string.\n",
		})
		.option("time-until", {
			type: "string",
			description: "Inclusive upper bound for the dataset's timestamp column.",
		})
		.option("time-since", {
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
		.conflicts("scope-account", ["scope-zone"])
		.conflicts("scope-zone", ["scope-account"])
		.check((argv) => {
			const groupSet = ["time-until", "time-since"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["time-since"].filter((k) => argv[k] === undefined);
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
	command: "query <query>",
	describe: "Query analytics datasets",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "sql query",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf sql query",
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
											scope: {
												accountTag: resolveFileToken(
													argv["scope-account"] as string | undefined,
													"scope-account",
													"text"
												),
												zoneTag: resolveFileToken(
													argv["scope-zone"] as string | undefined,
													"scope-zone",
													"text"
												),
											},
											time_range: {
												end: resolveFileToken(
													argv["time-until"] as string | undefined,
													"time-until",
													"text"
												),
												start: resolveFileToken(
													argv["time-since"] as string | undefined,
													"time-since",
													"text"
												),
											},
											query: argv["query"],
										}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(client, "POST", `/analytics/sql`, {
							body: fileContent,
							headers: { "Content-Type": "text/plain" },
						})
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(client, "POST", `/analytics/sql`, {
							body: bodyData,
						})
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["scope-account"] !== undefined)
					setNestedValue(
						bodyData,
						["scope", "accountTag"],
						resolveFileToken(
							argv["scope-account"] as string | undefined,
							"scope-account",
							"text"
						)
					);
				if (argv["scope-zone"] !== undefined)
					setNestedValue(
						bodyData,
						["scope", "zoneTag"],
						resolveFileToken(
							argv["scope-zone"] as string | undefined,
							"scope-zone",
							"text"
						)
					);
				if (argv["time-until"] !== undefined)
					setNestedValue(
						bodyData,
						["time_range", "end"],
						resolveFileToken(
							argv["time-until"] as string | undefined,
							"time-until",
							"text"
						)
					);
				if (argv["time-since"] !== undefined)
					setNestedValue(
						bodyData,
						["time_range", "start"],
						resolveFileToken(
							argv["time-since"] as string | undefined,
							"time-since",
							"text"
						)
					);
				if (argv["query"] !== undefined) bodyData["query"] = argv["query"];
				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(client, "POST", `/analytics/sql`, {
						body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
