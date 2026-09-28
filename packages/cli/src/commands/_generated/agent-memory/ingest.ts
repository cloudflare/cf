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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * ingest command
 * @generated from apis/overlays/agent-memory.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 agent-memory ingest <profile-name>\n\nProcesses a conversation and extracts structured memories from it. Agent Memory identifies facts, events, instructions, and tasks automatically."
		)
		.positional("profile-name", {
			type: "string",
			description: "Profile name.",
			demandOption: true,
		})
		.option("namespace-name", {
			type: "string",
			description: "Namespace name.",
			demandOption: true,
		})
		.option("messages", {
			type: "string",
			description:
				"Conversation messages to extract memories from. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("session-id", {
			type: "string",
			description: "Session identifier.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"agent-memory-ingest">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "ingest <profile-name>",
	describe: "Ingest messages",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "agent-memory ingest",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf agent-memory ingest",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/agent-memory/namespaces/${argv["namespace-name"] == null ? "<namespace-name>" : encodeURIComponent(String(argv["namespace-name"]))}/profiles/${argv["profile-name"] == null ? "<profile-name>" : encodeURIComponent(String(argv["profile-name"]))}/ingest`,
						pathParams: {
							"namespace-name": String(argv["namespace-name"] ?? ""),
							"profile-name": String(argv["profile-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										messages: parseObjectArray(argv["messages"], "messages"),
										sessionId: resolveFileToken(
											argv["session-id"] as string | undefined,
											"session-id",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.agentMemory.ingest({
							...bodyData,
							account_id: accountId,
							namespace_name: argv["namespace-name"],
							profile_name: argv["profile-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["messages"] === undefined) {
					throw new Error(
						"--messages is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					messages: parseObjectArray(argv["messages"], "messages"),
					sessionId: resolveFileToken(
						argv["session-id"] as string | undefined,
						"session-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.agentMemory.ingest({
						...bodyData,
						account_id: accountId,
						namespace_name: argv["namespace-name"],
						profile_name: argv["profile-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
