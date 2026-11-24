import operation from "../../../_operations/cloudforce-one/rules/email/update.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <id>",
	describe: "Update an email rule",
	usage:
		"$0 cloudforce-one rules email update <id>\n\nUpdates an existing structured email rule.",
	flags: {
		"condition-conditions": {
			kind: "parsed",
			brief:
				'The condition.conditions field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"field": string, "operator": "==" | "!=" | ">" | ...more, "type": "scalar", "value": (string | number | boolean)} | {"conditions": [{...}], "field": string, "type": "array", "quantifier"?: "any" | "all"} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"condition-operator": {
			kind: "parsed",
			brief: "The condition.operator field",
			optional: true,
			choices: ["and", "or"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "condition-operator", "text"),
		},
		"condition-type": {
			kind: "parsed",
			brief: "The condition.type field",
			optional: true,
			choices: ["group"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "condition-type", "text"),
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		meta: {
			kind: "parsed",
			brief:
				'The meta field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "value": (string | number | boolean)}].',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Disposition for matching email. This emits status metadata with the selected value.",
			optional: true,
			choices: ["silent", "blocking"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		strings: {
			kind: "parsed",
			brief:
				'The strings field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"identifier": string, "type": "string_match", "value": string, "match_type"?: "text" | "hex" | "regex", "modifiers"?: ["nocase" | "wide" | "ascii" | ...more]}]. ? marks optional keys.',
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
			placeholder: "id",
			brief: "The unique identifier for the rule.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"condition-conditions",
				"condition-operator",
				"condition-type",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"condition-conditions",
					"condition-operator",
					"condition-type",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --condition-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one rules email update",
				classification: {
					safeFlags: [
						"condition-operator",
						"condition-type",
						"enabled",
						"status",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules email update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/structured/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										condition: {
											conditions: parseObjectArray(
												argv["condition-conditions"],
												"condition-conditions"
											),
											operator: argv["condition-operator"],
											type: argv["condition-type"],
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										meta: parseObjectArray(argv["meta"], "meta"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										status: argv["status"],
										strings: parseObjectArray(argv["strings"], "strings"),
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
							id: argv["id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					condition: {
						conditions: parseObjectArray(
							argv["condition-conditions"],
							"condition-conditions"
						),
						operator: argv["condition-operator"],
						type: argv["condition-type"],
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					meta: parseObjectArray(argv["meta"], "meta"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					status: argv["status"],
					strings: parseObjectArray(argv["strings"], "strings"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
