/**
 * profile command
 * @generated from apis/overlays/workers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "profile <deployment-id>",
	describe: "Profile Preview Deployment",
	usage:
		"$0 workers previews deployments profile <deployment-id>\n\nCaptures a CPU or heap profile from a recently active isolate running the specified Preview deployment. This endpoint requires the Worker Preview profiling feature to be enabled for the account. If the deployment's bundle is identical to another deployed Worker version in the account, the profile may be captured from an isolate running that version.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifies the Worker by ID or name.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		"preview-id": {
			kind: "parsed",
			brief:
				"Identifier for the Preview, which can be ID, slug, or URL-encoded name.",
			parse: String,
		},
		"actor-id": {
			kind: "parsed",
			brief:
				"Identifies the exact Durable Object actor to profile. Must be specified together with namespace_id. The actor must currently be active and running the requested version.",
			optional: true,
			parse: String,
		},
		"duration-ms": {
			kind: "parsed",
			brief: "Profile duration in milliseconds.",
			optional: true,
			parse: Number,
		},
		"namespace-id": {
			kind: "parsed",
			brief:
				"Identifies the Durable Object namespace containing the actor to profile. Must be specified together with actor_id.",
			optional: true,
			parse: String,
		},
		"profile-type": {
			kind: "parsed",
			brief: "The profile_type field",
			default: "cpu",
			choices: ["cpu", "heap"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "profile-type", "text"),
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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "deployment-id",
			brief:
				'Identifier for the deployment, which can be a UUID, a UUID prefix (minimum length 8), or the literal "latest" to select the most recently created deployment.',
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers previews deployments profile",
				classification: {
					safeFlags: ["profile-type", "dry-run", "text"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const scriptName = await getWorkerName({
					scriptName: argv["worker"],
					quiet: argv["quiet"] as boolean | undefined,
				});
				argv["worker"] = scriptName;
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["duration-ms"] === undefined) {
						throw new Error(
							"--duration-ms is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers previews deployments profile",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/workers/${encodeURIComponent(scriptName)}/previews/${argv["preview-id"] == null ? "<preview-id>" : encodeURIComponent(String(argv["preview-id"]))}/deployments/${argv["deployment-id"] == null ? "<deployment-id>" : encodeURIComponent(String(argv["deployment-id"]))}/profile`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							"preview-id": String(argv["preview-id"] ?? ""),
							"deployment-id": String(argv["deployment-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										actor_id: resolveFileToken(
											argv["actor-id"] as string | undefined,
											"actor-id",
											"text"
										),
										duration_ms: argv["duration-ms"],
										namespace_id: resolveFileToken(
											argv["namespace-id"] as string | undefined,
											"namespace-id",
											"text"
										),
										profile_type: argv["profile-type"],
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
					const __cfRawBytes = await withProgress(`Creating`, async () =>
						fetchRawBytes(
							`/accounts/${accountId}/workers/workers/${encodeURIComponent(scriptName)}/previews/${encodeURIComponent(String(argv["preview-id"]))}/deployments/${encodeURIComponent(String(argv["deployment-id"]))}/profile`,
							{
								method: "POST",
								local: argv.local === true,
								persistTo: argv.persistTo as string | undefined,
								body: JSON.stringify(bodyData),
								contentType: "application/json",
							}
						)
					);
					writeRawOutput(
						argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
					);
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["actor-id"] !== undefined)
					setNestedValue(
						bodyData,
						["actor_id"],
						resolveFileToken(
							argv["actor-id"] as string | undefined,
							"actor-id",
							"text"
						)
					);
				if (argv["duration-ms"] !== undefined)
					setNestedValue(bodyData, ["duration_ms"], argv["duration-ms"]);
				if (argv["namespace-id"] !== undefined)
					setNestedValue(
						bodyData,
						["namespace_id"],
						resolveFileToken(
							argv["namespace-id"] as string | undefined,
							"namespace-id",
							"text"
						)
					);
				if (argv["profile-type"] !== undefined)
					setNestedValue(bodyData, ["profile_type"], argv["profile-type"]);
				const __cfRawBytes = await withProgress(`Creating`, async () =>
					fetchRawBytes(
						`/accounts/${accountId}/workers/workers/${encodeURIComponent(scriptName)}/previews/${encodeURIComponent(String(argv["preview-id"]))}/deployments/${encodeURIComponent(String(argv["deployment-id"]))}/profile`,
						{
							method: "POST",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
						}
					)
				);
				writeRawOutput(
					argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
				);
				return;
			}
		),
});

export default command;
