import operation from "../../_operations/workflows/instances/create.js";
/**
 * create command
 * @generated from apis/overlays/workflows.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseScalarValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <workflow-name>",
	describe: "Create a new workflow instance",
	usage:
		"$0 workflows instances create <workflow-name>\n\nCreates a new instance of a workflow, starting its execution.",
	flags: {
		"instance-id": {
			kind: "parsed",
			brief:
				"The system reserves IDs that consist of the `cf_` prefix and exactly 64 lowercase hexadecimal characters.",
			optional: true,
			parse: String,
		},
		"instance-retention-error": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"instance-retention-success": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"location-hint": {
			kind: "parsed",
			brief: "The location_hint field",
			optional: true,
			choices: [
				"wnam",
				"weur",
				"enam",
				"eeur",
				"apac",
				"apac-ne",
				"apac-se",
				"oc",
				"sam",
				"afr",
				"me",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "location-hint", "text"),
		},
		params: {
			kind: "parsed",
			brief: "JSON-encoded event payload passed into the new instance.",
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
		{ placeholder: "workflow-name", brief: "Workflow name", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances create",
				classification: {
					safeFlags: ["location-hint", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										instance_id: resolveFileToken(
											argv["instance-id"] as string | undefined,
											"instance-id",
											"text"
										),
										instance_retention: {
											error_retention: parseScalarValue(
												argv["instance-retention-error"],
												"instance-retention-error"
											),
											success_retention: parseScalarValue(
												argv["instance-retention-success"],
												"instance-retention-success"
											),
										},
										location_hint: argv["location-hint"],
										params: resolveFileToken(
											argv["params"] as string | undefined,
											"params",
											"json"
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							workflow_name: argv["workflow-name"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					instance_id: resolveFileToken(
						argv["instance-id"] as string | undefined,
						"instance-id",
						"text"
					),
					instance_retention: {
						error_retention: parseScalarValue(
							argv["instance-retention-error"],
							"instance-retention-error"
						),
						success_retention: parseScalarValue(
							argv["instance-retention-success"],
							"instance-retention-success"
						),
					},
					location_hint: argv["location-hint"],
					params: resolveFileToken(
						argv["params"] as string | undefined,
						"params",
						"json"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						workflow_name: argv["workflow-name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
