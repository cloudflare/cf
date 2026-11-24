import operation from "../../_operations/cloudforce-one/rules/update.js";
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
	describe: "Update a rule",
	usage: "$0 cloudforce-one rules update <id>\n\nUpdates an existing rule.",
	flags: {
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
			optional: true,
		},
		"is-public": {
			kind: "boolean",
			brief: "Whether this rule is visible to other internal accounts.",
			optional: true,
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
			brief: "The namespaces field",
			variadic: true,
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief: "Path change goes through approval workflow.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one rules update",
				classification: {
					safeFlags: ["enabled", "is-public", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
