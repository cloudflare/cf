import operation from "../../_operations/cloudforce-one/rules/create.js";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a rule",
	usage: "$0 cloudforce-one rules create\n\nCreate a new detection rule.",
	flags: {
		actions: {
			kind: "parsed",
			brief:
				'The actions field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"action_config": {...}, "action_type": "alert_gchat" | "webhook" | "logging" | ...more, "enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"commit-message": {
			kind: "parsed",
			brief:
				"Human-readable justification for this change. Required for internal-account submissions; optional for customer accounts and automated sync.",
			optional: true,
			parse: String,
		},
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief:
				"Human-readable description of the rule. Auto-extracted from YARA meta if present.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether this rule is active for dice consumers.",
			default: true,
		},
		"is-public": {
			kind: "boolean",
			brief: "Whether this rule is visible to other internal accounts.",
			default: false,
		},
		meta: {
			kind: "parsed",
			brief:
				"Adds YARA meta entries to the rule's meta block and stores them in rule_meta alongside content metadata. Use valid YARA identifiers for keys; exclude 'name', 'enabled', and 'description'. You may repeat keys. Provide as a JSON array of objects or @path/to/file.json. Shape: [{\"key\": string, \"value\": (string | number | boolean)}].",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		namespaces: {
			kind: "parsed",
			brief:
				"Optional WfP deployment tags (customer rules only). Internal rules leave empty.",
			variadic: true,
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief: "The path field",
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
				command: "cloudforce-one rules create",
				classification: {
					safeFlags: ["enabled", "is-public", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["content"] === undefined) {
						argv["content"] = await promptForRequiredField(
							"content",
							"The content field"
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
					if (argv["path"] === undefined) {
						argv["path"] = await promptForRequiredField(
							"path",
							"The path field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										actions: parseObjectArray(argv["actions"], "actions"),
										commit_message: resolveFileToken(
											argv["commit-message"] as string | undefined,
											"commit-message",
											"text"
										),
										content: resolveFileToken(
											argv["content"] as string | undefined,
											"content",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										is_public: argv["is-public"],
										meta: parseObjectArray(argv["meta"], "meta"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										namespaces: argv["namespaces"],
										path: resolveFileToken(
											argv["path"] as string | undefined,
											"path",
											"text"
										),
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
					actions: parseObjectArray(argv["actions"], "actions"),
					commit_message: resolveFileToken(
						argv["commit-message"] as string | undefined,
						"commit-message",
						"text"
					),
					content: resolveFileToken(
						argv["content"] as string | undefined,
						"content",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					is_public: argv["is-public"],
					meta: parseObjectArray(argv["meta"], "meta"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					namespaces: argv["namespaces"],
					path: resolveFileToken(
						argv["path"] as string | undefined,
						"path",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
