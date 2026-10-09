import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * recall command
 * @generated from apis/overlays/agent-memory.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 agent-memory recall <profile-name>\n\nRetrieves memories relevant to the query and returns a synthesized answer."
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
		.option("query", {
			type: "string",
			description: "Natural-language query to match against stored memories.",
		})
		.option("reference-date", {
			type: "string",
			description: "Temporal anchor for relative date references in the query.",
		})
		.option("response-length", {
			type: "string",
			description: "Verbosity of the synthesized answer. Defaults to 'medium'.",
			choices: ["short", "medium", "long"],
		})
		.coerce("response-length", (value: string | undefined) =>
			resolveFileToken(value, "response-length", "text")
		)
		.option("thinking-level", {
			type: "string",
			description: "Recall intensity / search depth. Defaults to 'low'.",
			choices: ["low", "medium", "high"],
		})
		.coerce("thinking-level", (value: string | undefined) =>
			resolveFileToken(value, "thinking-level", "text")
		)
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

type Request = SdkRequest<"agent-memory-recall">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "recall <profile-name>",
	describe: "Recall memories",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "agent-memory recall",
				classification: {
					safeFlags: ["response-length", "thinking-level", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf agent-memory recall",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/agent-memory/namespaces/${argv["namespace-name"] == null ? "<namespace-name>" : encodeURIComponent(String(argv["namespace-name"]))}/profiles/${argv["profile-name"] == null ? "<profile-name>" : encodeURIComponent(String(argv["profile-name"]))}/recall`,
						pathParams: {
							"namespace-name": String(argv["namespace-name"] ?? ""),
							"profile-name": String(argv["profile-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										query: resolveFileToken(
											argv["query"] as string | undefined,
											"query",
											"text"
										),
										referenceDate: resolveFileToken(
											argv["reference-date"] as string | undefined,
											"reference-date",
											"text"
										),
										responseLength: argv["response-length"],
										thinkingLevel: argv["thinking-level"],
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
						client.agentMemory.recall({
							...bodyData,
							account_id: accountId,
							namespace_name: argv["namespace-name"],
							profile_name: argv["profile-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["query"] === undefined) {
					argv["query"] = await promptForRequiredField(
						"query",
						"Natural-language query to match against stored memories."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					query: resolveFileToken(
						argv["query"] as string | undefined,
						"query",
						"text"
					),
					referenceDate: resolveFileToken(
						argv["reference-date"] as string | undefined,
						"reference-date",
						"text"
					),
					responseLength: argv["response-length"],
					thinkingLevel: argv["thinking-level"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.agentMemory.recall({
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
