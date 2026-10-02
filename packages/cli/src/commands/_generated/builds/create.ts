import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/builds.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds create <trigger-uuid>\n\nStart a build for a branch or commit using the selected trigger."
		)
		.positional("trigger-uuid", {
			type: "string",
			description: "Trigger UUID.",
			demandOption: true,
		})
		.option("seed-repo-owner", {
			type: "string",
			description: "Repository owner or namespace.",
		})
		.option("seed-repo-path", {
			type: "string",
			description: "Path within the repository to seed.",
		})
		.option("seed-repo-provider", {
			type: "string",
			description: "Source control provider for the seed repository.",
			choices: ["github", "gitlab"],
		})
		.option("seed-repo-repository", {
			type: "string",
			description: "Repository name.",
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
		.check((argv) => {
			const groupSet = [
				"seed-repo-owner",
				"seed-repo-path",
				"seed-repo-provider",
				"seed-repo-repository",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"seed-repo-owner",
					"seed-repo-provider",
					"seed-repo-repository",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --seed_repo-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createManualBuild">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <trigger-uuid>",
	describe: "Start a Workers build",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds create",
				classification: {
					safeFlags: ["seed-repo-provider", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/triggers/${argv["trigger-uuid"] == null ? "<trigger-uuid>" : encodeURIComponent(String(argv["trigger-uuid"]))}/builds`,
						pathParams: { "trigger-uuid": String(argv["trigger-uuid"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										seed_repo: {
											owner: resolveFileToken(
												argv["seed-repo-owner"] as string | undefined,
												"seed-repo-owner",
												"text"
											),
											path: resolveFileToken(
												argv["seed-repo-path"] as string | undefined,
												"seed-repo-path",
												"text"
											),
											provider: resolveFileToken(
												argv["seed-repo-provider"] as string | undefined,
												"seed-repo-provider",
												"text"
											),
											repository: resolveFileToken(
												argv["seed-repo-repository"] as string | undefined,
												"seed-repo-repository",
												"text"
											),
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.builds.create({
							body: bodyData,
							account_id: accountId,
							trigger_uuid: argv["trigger-uuid"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					seed_repo: {
						owner: resolveFileToken(
							argv["seed-repo-owner"] as string | undefined,
							"seed-repo-owner",
							"text"
						),
						path: resolveFileToken(
							argv["seed-repo-path"] as string | undefined,
							"seed-repo-path",
							"text"
						),
						provider: resolveFileToken(
							argv["seed-repo-provider"] as string | undefined,
							"seed-repo-provider",
							"text"
						),
						repository: resolveFileToken(
							argv["seed-repo-repository"] as string | undefined,
							"seed-repo-repository",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.builds.create({
						body: bodyData,
						account_id: accountId,
						trigger_uuid: argv["trigger-uuid"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
