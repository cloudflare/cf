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
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * fork command
 * @generated from apis/overlays/artifacts.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 artifacts namespaces repos fork <name>\n\nForks a source repository into a new repository."
		)
		.positional("name", {
			type: "string",
			description: "Repository name.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description: "Artifacts namespace name.",
			demandOption: true,
		})
		.option("default-branch-only", {
			type: "boolean",
			description: "The default_branch_only field",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("read-only", {
			type: "boolean",
			description: "The read_only field",
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

type Request = SdkRequest<"artifacts_repos_fork">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "fork <name>",
	describe: "Fork a repository",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "artifacts namespaces repos fork",
				classification: {
					safeFlags: ["default-branch-only", "read-only", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf artifacts namespaces repos fork",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/repos/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/fork`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default_branch_only: argv["default-branch-only"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										read_only: argv["read-only"],
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
						client.artifacts.namespaces.repos.fork({
							...bodyData,
							account_id: accountId,
							namespace: argv["namespace"],
							name: argv["name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					default_branch_only: argv["default-branch-only"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					read_only: argv["read-only"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.artifacts.namespaces.repos.fork({
						...bodyData,
						account_id: accountId,
						namespace: argv["namespace"],
						name: argv["name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
