import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * profile command
 * @generated from apis/overlays/workers.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers versions profile <version-id>\n\nCaptures a CPU or heap profile from a recently active isolate running the specified Worker version. This endpoint requires the Worker profiling feature to be enabled for the account."
		)
		.positional("version-id", {
			type: "string",
			description:
				'Identifies the version by UUID or UUID prefix with a minimum length of eight characters. Use "latest" to select the most recently created version.',
			demandOption: true,
		})
		.option("worker-id", {
			type: "string",
			description: "Identifies the Worker by ID or name.",
			demandOption: true,
		})
		.option("actor-id", {
			type: "string",
			description:
				"Identifies the exact Durable Object actor to profile. Must be specified together with namespace_id. The actor must currently be active and running the requested Worker version.",
		})
		.option("duration-ms", {
			type: "number",
			description: "Profile duration in milliseconds.",
		})
		.option("namespace-id", {
			type: "string",
			description:
				"Identifies the Durable Object namespace containing the actor to profile. Must be specified together with actor_id.",
		})
		.option("profile-type", {
			type: "string",
			description: "The profile_type field",
			choices: ["cpu", "heap"],
			default: "cpu",
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
		.option("text", {
			type: "boolean",
			description:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "profile <version-id>",
	describe: "Profile Worker Version",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers versions profile",
				classification: {
					safeFlags: ["profile-type", "dry-run", "text"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers versions profile",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/workers/${argv["worker-id"] == null ? "<worker-id>" : encodeURIComponent(String(argv["worker-id"]))}/versions/${argv["version-id"] == null ? "<version-id>" : encodeURIComponent(String(argv["version-id"]))}/profile`,
						pathParams: {
							"worker-id": String(argv["worker-id"] ?? ""),
							"version-id": String(argv["version-id"] ?? ""),
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
										profile_type: resolveFileToken(
											argv["profile-type"] as string | undefined,
											"profile-type",
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
					const __cfRawBytes = await withProgress(`Creating`, async () =>
						fetchRawBytes(
							`/accounts/${accountId}/workers/workers/${encodeURIComponent(String(argv["worker-id"]))}/versions/${encodeURIComponent(String(argv["version-id"]))}/profile`,
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
				if (argv["duration-ms"] === undefined) {
					throw new Error(
						"--duration-ms is required (or pass --body with this field set)."
					);
				}

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
					setNestedValue(
						bodyData,
						["profile_type"],
						resolveFileToken(
							argv["profile-type"] as string | undefined,
							"profile-type",
							"text"
						)
					);
				const __cfRawBytes = await withProgress(`Creating`, async () =>
					fetchRawBytes(
						`/accounts/${accountId}/workers/workers/${encodeURIComponent(String(argv["worker-id"]))}/versions/${encodeURIComponent(String(argv["version-id"]))}/profile`,
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
};

export default command;
