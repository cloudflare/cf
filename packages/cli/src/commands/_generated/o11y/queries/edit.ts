import operation from "../../_operations/o11y/queries/edit.js";
/**
 * edit command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <queryId>",
	describe: "Update query",
	usage: "$0 o11y queries edit <queryId>\n\nUpdate saved query.",
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Query name",
			optional: true,
			parse: String,
		},
		"parameters-calculations": {
			kind: "parsed",
			brief:
				'Create Calculations to compute as part of the query. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"operator": "count" | "COUNT", "alias"?: string, "key"?: string, "keyType"?: "string" | "number" | "boolean"} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"parameters-datasets": {
			kind: "parsed",
			brief:
				"Set the Datasets to query. Leave it empty to query all the datasets.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"parameters-filter-combination": {
			kind: "parsed",
			brief: "Set a Flag to describe how to combine the filters on the query.",
			optional: true,
			choices: ["and", "or", "AND", "OR"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "parameters-filter-combination", "text"),
		},
		"parameters-filters": {
			kind: "parsed",
			brief:
				'Configure the Filters to apply to the query. Supports nested groups via kind: \'group\'. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"filterCombination": "and" | "or" | "AND" | ...more, "filters": [{...}], "kind": "group"} | ...more)].',
			optional: true,
			parse: String,
		},
		"parameters-group-bys": {
			kind: "parsed",
			brief:
				'Define how to group the results of the query. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"type": "string" | "number" | "boolean", "value": string}].',
			optional: true,
			parse: String,
		},
		"parameters-havings": {
			kind: "parsed",
			brief:
				'Configure the Having clauses that filter on calculations in the query result. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "operation": "eq" | "neq" | "gt" | ...more, "value": number}].',
			optional: true,
			parse: String,
		},
		"parameters-limit": {
			kind: "parsed",
			brief:
				"Set a limit on the number of results / records returned by the query",
			optional: true,
			parse: Number,
		},
		"parameters-needle-is-regex": {
			kind: "boolean",
			brief: "The parameters.needle.isRegex field",
			optional: true,
		},
		"parameters-needle-match-case": {
			kind: "boolean",
			brief: "The parameters.needle.matchCase field",
			optional: true,
		},
		"parameters-order-by-order": {
			kind: "parsed",
			brief: "Set the order of the results",
			optional: true,
			choices: ["asc", "desc"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "parameters-order-by-order", "text"),
		},
		"parameters-order-by-value": {
			kind: "parsed",
			brief: "Configure which Calculation to order the results by.",
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
			brief: "Specify the new contents of the query.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "query-id", brief: "QueryId", parse: String }],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"parameters-order-by-order",
				"parameters-order-by-value",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["parameters-order-by-value"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --parameters-order-by-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y queries edit",
				classification: {
					safeFlags: [
						"parameters-filter-combination",
						"parameters-needle-is-regex",
						"parameters-needle-match-case",
						"parameters-order-by-order",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["description"] === undefined) {
						argv["description"] = await promptForRequiredField(
							"description",
							"The description field"
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField("name", "Query name");
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y queries edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/queries/${argv["query-id"] == null ? "<query-id>" : encodeURIComponent(String(argv["query-id"]))}`,
						pathParams: { "query-id": String(argv["query-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										parameters: {
											calculations: parseObjectArray(
												argv["parameters-calculations"],
												"parameters-calculations"
											),
											datasets: argv["parameters-datasets"],
											filterCombination: argv["parameters-filter-combination"],
											filters: parseObjectArray(
												argv["parameters-filters"],
												"parameters-filters"
											),
											groupBys: parseObjectArray(
												argv["parameters-group-bys"],
												"parameters-group-bys"
											),
											havings: parseObjectArray(
												argv["parameters-havings"],
												"parameters-havings"
											),
											limit: argv["parameters-limit"],
											needle: {
												isRegex: argv["parameters-needle-is-regex"],
												matchCase: argv["parameters-needle-match-case"],
											},
											orderBy: {
												order: argv["parameters-order-by-order"],
												value: resolveFileToken(
													argv["parameters-order-by-value"] as
														| string
														| undefined,
													"parameters-order-by-value",
													"text"
												),
											},
										},
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							queryId: argv["query-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					parameters: {
						calculations: parseObjectArray(
							argv["parameters-calculations"],
							"parameters-calculations"
						),
						datasets: argv["parameters-datasets"],
						filterCombination: argv["parameters-filter-combination"],
						filters: parseObjectArray(
							argv["parameters-filters"],
							"parameters-filters"
						),
						groupBys: parseObjectArray(
							argv["parameters-group-bys"],
							"parameters-group-bys"
						),
						havings: parseObjectArray(
							argv["parameters-havings"],
							"parameters-havings"
						),
						limit: argv["parameters-limit"],
						needle: {
							isRegex: argv["parameters-needle-is-regex"],
							matchCase: argv["parameters-needle-match-case"],
						},
						orderBy: {
							order: argv["parameters-order-by-order"],
							value: resolveFileToken(
								argv["parameters-order-by-value"] as string | undefined,
								"parameters-order-by-value",
								"text"
							),
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						queryId: argv["query-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
