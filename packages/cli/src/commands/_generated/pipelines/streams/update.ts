import operation from "../../_operations/pipelines/streams/update.js";
/**
 * update command
 * @generated from apis/overlays/pipelines.ts
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <stream-id>",
	describe: "Update Stream",
	usage: "$0 pipelines streams update <stream-id>\n\nUpdate a Stream.",
	flags: {
		"http-authentication": {
			kind: "boolean",
			brief: "Indicates that authentication is required for the HTTP endpoint.",
			optional: true,
		},
		"http-cors-origins": {
			kind: "parsed",
			brief: "The http.cors.origins field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"http-enabled": {
			kind: "boolean",
			brief: "Indicates that the HTTP endpoint is enabled.",
			optional: true,
		},
		"worker-binding-enabled": {
			kind: "boolean",
			brief: "Indicates that the worker binding is enabled.",
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
	operands: [
		{
			placeholder: "stream-id",
			brief: "Specifies the public ID of the stream.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"http-authentication",
				"http-cors-origins",
				"http-enabled",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["http-authentication", "http-enabled"].filter(
					(k) => argv[k] === undefined
				);
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
				command: "pipelines streams update",
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
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pipelines streams update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/streams/${argv["stream-id"] == null ? "<stream-id>" : encodeURIComponent(String(argv["stream-id"]))}`,
						pathParams: { "stream-id": String(argv["stream-id"] ?? "") },
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							stream_id: argv["stream-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					http: {
						authentication: argv["http-authentication"],
						cors: {
							origins: argv["http-cors-origins"],
						},
						enabled: argv["http-enabled"],
					},
					worker_binding: {
						enabled: argv["worker-binding-enabled"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						stream_id: argv["stream-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
