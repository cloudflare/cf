import operation from "../../_operations/cloudforce-one/priority-intelligence/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseNestedArray,
	parseObjectArray,
} from "#lib/body-parser.js";
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
			"$0 cloudforce-one priority-intelligence create\n\nCreates a new PIR for the account. The cfone.priority_intelligence_requirement_limit entitlement sets how many PIRs can be active; drafts do not count, but the account can hold at most five times that many PIRs in total. An active PIR requires a query."
		)
		.option("dataset-scope-type", {
			type: "string",
			description: "The dataset_scope.type field",
			choices: ["default", "datasets"],
		})
		.coerce("dataset-scope-type", (value) =>
			resolveFileToken(value, "dataset-scope-type", "text")
		)
		.option("dataset-scope-dataset-ids", {
			type: "string",
			array: true,
			description: "The dataset_scope.dataset_ids field",
		})
		.option("digest-interval-hours", {
			type: "number",
			description:
				"Hours between digests: 6, 12, or 24. Used only when `notification_mode` is `digest`.",
			default: 24,
		})
		.option("intent-clauses", {
			type: "string",
			description:
				"The intent.clauses field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("intent-indicators", {
			type: "string",
			array: true,
			description: "The intent.indicators field",
		})
		.option("intent-unsupported-terms", {
			type: "string",
			array: true,
			description: "The intent.unsupported_terms field",
		})
		.option("labels", {
			type: "string",
			array: true,
			description: "The labels field",
		})
		.option("model", { type: "string", description: "The model field" })
		.option("notification-mode", {
			type: "string",
			description:
				"`none` or `digest`. Notifications are opt-in. `immediate` is reserved and currently rejected.",
			choices: ["none", "immediate", "digest"],
			default: "none",
		})
		.coerce("notification-mode", (value) =>
			resolveFileToken(value, "notification-mode", "text")
		)
		.option("priority", {
			type: "number",
			description: "The priority field",
			default: 0,
		})
		.option("query-branches", {
			type: "string",
			description:
				"Event List `searchBranches`: filters within a branch are ANDed, branches are ORed. Provide as a JSON array of arrays or @path/to/file.json.",
		})
		.option("query-version", {
			type: "number",
			description:
				"Ignored. Accepted so a PIR read from the API can be sent back unchanged.",
		})
		.option("query-source", {
			type: "string",
			description: "The query_source field",
			choices: ["generated", "edited"],
		})
		.coerce("query-source", (value) =>
			resolveFileToken(value, "query-source", "text")
		)
		.option("requirement", {
			type: "string",
			description: "The requirement field",
		})
		.option("status", {
			type: "string",
			description:
				"`draft`: not monitored. `active`: monitored, unless `pause_reason` is set. Setting `active` on a PIR with a `pause_reason` resumes it. Moving a PIR back to `draft` and activating it again starts matching afresh with a 30-day backfill.",
			choices: ["draft", "active"],
			default: "draft",
		})
		.coerce("status", (value) => resolveFileToken(value, "status", "text"))
		.option("title", { type: "string", description: "The title field" })
		.option("tlp", {
			type: "string",
			description: "The tlp field",
			default: "amber",
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
		.check((argv) => {
			const groupSet = ["dataset-scope-type", "dataset-scope-dataset-ids"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["dataset-scope-type"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --dataset_scope-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"intent-clauses",
				"intent-indicators",
				"intent-unsupported-terms",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"intent-clauses",
					"intent-indicators",
					"intent-unsupported-terms",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --intent-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = ["query-branches", "query-version"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["query-branches"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --query-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a priority intelligence requirement",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence create",
				classification: {
					safeFlags: [
						"dataset-scope-type",
						"notification-mode",
						"query-source",
						"status",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dataset_scope: {
											type: argv["dataset-scope-type"],
											dataset_ids: argv["dataset-scope-dataset-ids"],
										},
										digest_interval_hours: argv["digest-interval-hours"],
										intent: {
											clauses: parseObjectArray(
												argv["intent-clauses"],
												"intent-clauses"
											),
											indicators: argv["intent-indicators"],
											unsupported_terms: argv["intent-unsupported-terms"],
										},
										labels: argv["labels"],
										model: resolveFileToken(
											argv["model"] as string | undefined,
											"model",
											"text"
										),
										notification_mode: argv["notification-mode"],
										priority: argv["priority"],
										query: {
											branches: parseNestedArray(
												argv["query-branches"],
												"query-branches"
											),
											version: argv["query-version"],
										},
										query_source: argv["query-source"],
										requirement: resolveFileToken(
											argv["requirement"] as string | undefined,
											"requirement",
											"text"
										),
										status: argv["status"],
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										tlp: resolveFileToken(
											argv["tlp"] as string | undefined,
											"tlp",
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
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["requirement"] === undefined) {
					argv["requirement"] = await promptForRequiredField(
						"requirement",
						"The requirement field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					dataset_scope: {
						type: argv["dataset-scope-type"],
						dataset_ids: argv["dataset-scope-dataset-ids"],
					},
					digest_interval_hours: argv["digest-interval-hours"],
					intent: {
						clauses: parseObjectArray(argv["intent-clauses"], "intent-clauses"),
						indicators: argv["intent-indicators"],
						unsupported_terms: argv["intent-unsupported-terms"],
					},
					labels: argv["labels"],
					model: resolveFileToken(
						argv["model"] as string | undefined,
						"model",
						"text"
					),
					notification_mode: argv["notification-mode"],
					priority: argv["priority"],
					query: {
						branches: parseNestedArray(
							argv["query-branches"],
							"query-branches"
						),
						version: argv["query-version"],
					},
					query_source: argv["query-source"],
					requirement: resolveFileToken(
						argv["requirement"] as string | undefined,
						"requirement",
						"text"
					),
					status: argv["status"],
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					tlp: resolveFileToken(
						argv["tlp"] as string | undefined,
						"tlp",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
