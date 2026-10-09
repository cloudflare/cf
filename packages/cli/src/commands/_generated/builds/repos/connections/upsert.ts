import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * upsert command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds repos connections upsert\n\nSave the repository connection required by build triggers."
		)
		.option("provider-account-id", {
			type: "string",
			description:
				"Provider-specific identifier of the account or namespace that owns the repository.",
		})
		.option("provider-account-name", {
			type: "string",
			description:
				"Human-readable name of the account or namespace that owns the repository.",
		})
		.option("provider-type", {
			type: "string",
			description: "Source control provider.",
			choices: ["github", "gitlab", "gitlab_internal", "origin"],
		})
		.coerce("provider-type", (value) =>
			resolveFileToken(value, "provider-type", "text")
		)
		.option("repo-id", {
			type: "string",
			description: "Provider-specific repository identifier.",
		})
		.option("repo-name", {
			type: "string",
			description: "Human-readable repository name.",
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

type Request = SdkRequest<"upsertRepoConnection">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "upsert",
	describe: "Create or update a repository connection",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds repos connections upsert",
				classification: {
					safeFlags: ["provider-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds repos connections upsert",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/repos/connections`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										provider_account_id: resolveFileToken(
											argv["provider-account-id"] as string | undefined,
											"provider-account-id",
											"text"
										),
										provider_account_name: resolveFileToken(
											argv["provider-account-name"] as string | undefined,
											"provider-account-name",
											"text"
										),
										provider_type: argv["provider-type"],
										repo_id: resolveFileToken(
											argv["repo-id"] as string | undefined,
											"repo-id",
											"text"
										),
										repo_name: resolveFileToken(
											argv["repo-name"] as string | undefined,
											"repo-name",
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
					const result = await withProgress(`Updating`, async () =>
						client.builds.repos.connections.upsert({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["provider-account-id"] === undefined) {
					argv["provider-account-id"] = await promptForRequiredField(
						"provider-account-id",
						"Provider-specific identifier of the account or namespace that owns the repository."
					);
				}
				if (argv["provider-account-name"] === undefined) {
					argv["provider-account-name"] = await promptForRequiredField(
						"provider-account-name",
						"Human-readable name of the account or namespace that owns the repository."
					);
				}
				if (argv["provider-type"] === undefined) {
					argv["provider-type"] = await promptForRequiredEnumField(
						"provider-type",
						"Source control provider.",
						["github", "gitlab", "gitlab_internal", "origin"] as const
					);
				}
				if (argv["repo-id"] === undefined) {
					argv["repo-id"] = await promptForRequiredField(
						"repo-id",
						"Provider-specific repository identifier."
					);
				}
				if (argv["repo-name"] === undefined) {
					argv["repo-name"] = await promptForRequiredField(
						"repo-name",
						"Human-readable repository name."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					provider_account_id: resolveFileToken(
						argv["provider-account-id"] as string | undefined,
						"provider-account-id",
						"text"
					),
					provider_account_name: resolveFileToken(
						argv["provider-account-name"] as string | undefined,
						"provider-account-name",
						"text"
					),
					provider_type: argv["provider-type"],
					repo_id: resolveFileToken(
						argv["repo-id"] as string | undefined,
						"repo-id",
						"text"
					),
					repo_name: resolveFileToken(
						argv["repo-name"] as string | undefined,
						"repo-name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.builds.repos.connections.upsert({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
