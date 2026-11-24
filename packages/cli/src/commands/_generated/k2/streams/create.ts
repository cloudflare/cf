import operation from "../../_operations/k2/streams/create.js";
/**
 * create command
 * @generated from apis/overlays/k2.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create K2 stream",
	usage:
		"$0 k2 streams create\n\nCreate a new K2 stream. HTTP is disabled when `http` is omitted. Enabled HTTP requires authentication and allows all origins unless `authentication` or `cors` say otherwise. At least one input must be enabled.",
	flags: {
		"http-authentication": {
			kind: "boolean",
			brief:
				"Indicates whether the HTTP endpoint requires an API token with K2 produce permission. When false, the endpoint accepts unauthenticated records. Defaults to true when HTTP is enabled without a stored value.",
			optional: true,
		},
		"http-cors-origins": {
			kind: "parsed",
			brief:
				"Allows browser requests from these HTTP or HTTPS origins. Use a wildcard only as the sole origin. An empty list blocks cross-origin browser requests. Defaults to `['*']` when HTTP is enabled without stored origins.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"http-enabled": {
			kind: "boolean",
			brief: "Indicates whether the HTTP endpoint accepts records.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Specifies the name of the K2 stream.",
			optional: true,
			parse: String,
		},
		"retention-seconds": {
			kind: "parsed",
			brief:
				"Sets the record retention period from 1 hour (3600 seconds) to 30 days (2592000 seconds), inclusive.",
			default: "604800",
			parse: Number,
		},
		"worker-binding-enabled": {
			kind: "boolean",
			brief:
				"Indicates whether Workers bindings can produce records to the stream.",
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"http-authentication",
				"http-cors-origins",
				"http-enabled",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["http-enabled"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --http-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "k2 streams create",
				classification: {
					safeFlags: [
						"http-authentication",
						"http-enabled",
						"worker-binding-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Specifies the name of the K2 stream."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf k2 streams create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/k2/streams`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										http: {
											authentication: argv["http-authentication"],
											cors: {
												origins: argv["http-cors-origins"],
											},
											enabled: argv["http-enabled"],
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										retention_seconds: argv["retention-seconds"],
										worker_binding: {
											enabled: argv["worker-binding-enabled"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					http: {
						authentication: argv["http-authentication"],
						cors: {
							origins: argv["http-cors-origins"],
						},
						enabled: argv["http-enabled"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					retention_seconds: argv["retention-seconds"],
					worker_binding: {
						enabled: argv["worker-binding-enabled"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
