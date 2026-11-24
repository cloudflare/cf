import operation from "../../_operations/o11y/destinations/create.js";
/**
 * create command
 * @generated from apis/overlays/o11y.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create Destination",
	usage:
		"$0 o11y destinations create\n\nCreate a new Workers Observability Telemetry Destination.",
	flags: {
		"configuration-headers": {
			kind: "parsed",
			brief:
				'The configuration.headers field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"configuration-logpush-dataset": {
			kind: "parsed",
			brief: "The configuration.logpushDataset field",
			optional: true,
			choices: [
				"opentelemetry-traces",
				"opentelemetry-logs",
				"opentelemetry-metrics",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-logpush-dataset", "text"),
		},
		"configuration-type": {
			kind: "parsed",
			brief: "The configuration.type field",
			optional: true,
			choices: ["logpush"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-type", "text"),
		},
		"configuration-url": {
			kind: "parsed",
			brief: "The configuration.url field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"skip-preflight-check": {
			kind: "boolean",
			brief: "The skipPreflightCheck field",
			optional: true,
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
				command: "o11y destinations create",
				classification: {
					safeFlags: [
						"configuration-logpush-dataset",
						"configuration-type",
						"enabled",
						"skip-preflight-check",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["configuration-headers"] === undefined) {
						throw new Error(
							"--configuration-headers is required (or pass --body with this field set)."
						);
					}
					if (argv["configuration-logpush-dataset"] === undefined) {
						argv["configuration-logpush-dataset"] =
							await promptForRequiredEnumField(
								"configuration-logpush-dataset",
								"The configuration.logpushDataset field",
								[
									"opentelemetry-traces",
									"opentelemetry-logs",
									"opentelemetry-metrics",
								] as const
							);
					}
					if (argv["configuration-type"] === undefined) {
						argv["configuration-type"] = await promptForRequiredEnumField(
							"configuration-type",
							"The configuration.type field",
							["logpush"] as const
						);
					}
					if (argv["configuration-url"] === undefined) {
						argv["configuration-url"] = await promptForRequiredField(
							"configuration-url",
							"The configuration.url field"
						);
					}
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y destinations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/destinations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [
										{
											path: ["configuration", "headers"],
											flag: "configuration-headers",
										},
									])
								: compactBody(
										{
											configuration: {
												headers: parseJsonMap(
													argv["configuration-headers"],
													"configuration-headers",
													true
												),
												logpushDataset: argv["configuration-logpush-dataset"],
												type: argv["configuration-type"],
												url: resolveFileToken(
													argv["configuration-url"] as string | undefined,
													"configuration-url",
													"text"
												),
											},
											enabled: argv["enabled"],
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											skipPreflightCheck: argv["skip-preflight-check"],
										},
										[["configuration", "headers"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? parseBody(argv.body, [
								{
									path: ["configuration", "headers"],
									flag: "configuration-headers",
								},
							])
						: undefined;
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
				const bodyData = compactBody(
					{
						configuration: {
							headers: parseJsonMap(
								argv["configuration-headers"],
								"configuration-headers",
								true
							),
							logpushDataset: argv["configuration-logpush-dataset"],
							type: argv["configuration-type"],
							url: resolveFileToken(
								argv["configuration-url"] as string | undefined,
								"configuration-url",
								"text"
							),
						},
						enabled: argv["enabled"],
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						skipPreflightCheck: argv["skip-preflight-check"],
					},
					[["configuration", "headers"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
