import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/artifacts.ts
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
			"$0 artifacts namespaces tokens create <namespace>\n\nCreates a scoped Git token for a repository."
		)
		.positional("namespace", {
			type: "string",
			description: "Artifacts namespace name.",
			demandOption: true,
		})
		.option("repo", { type: "string", description: "The repo field" })
		.option("scope", {
			type: "string",
			description: "The scope field",
			choices: ["read", "write"],
		})
		.coerce("scope", (value: string | undefined) =>
			resolveFileToken(value, "scope", "text")
		)
		.option("ttl", { type: "number", description: "The ttl field" })
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

type Request = SdkRequest<"artifacts_tokens_create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <namespace>",
	describe: "Create a repository token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "artifacts namespaces tokens create",
				classification: {
					safeFlags: ["scope", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf artifacts namespaces tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tokens`,
						pathParams: { namespace: String(argv["namespace"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										repo: resolveFileToken(
											argv["repo"] as string | undefined,
											"repo",
											"text"
										),
										scope: argv["scope"],
										ttl: argv["ttl"],
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
						client.artifacts.namespaces.tokens.create({
							...bodyData,
							account_id: accountId,
							namespace: argv["namespace"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["repo"] === undefined) {
					argv["repo"] = await promptForRequiredField("repo", "The repo field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					repo: resolveFileToken(
						argv["repo"] as string | undefined,
						"repo",
						"text"
					),
					scope: argv["scope"],
					ttl: argv["ttl"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.artifacts.namespaces.tokens.create({
						...bodyData,
						account_id: accountId,
						namespace: argv["namespace"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
