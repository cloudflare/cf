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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds triggers create\n\nCreate a trigger defining the repository connection, Worker tag, commands, filters, cache setting, and build token."
		)
		.option("branch-excludes", {
			type: "string",
			array: true,
			description: "Branch patterns that must not start builds.",
		})
		.option("branch-includes", {
			type: "string",
			array: true,
			description: "Branch patterns that can start builds.",
		})
		.option("build-caching-enabled", {
			type: "boolean",
			description:
				"Whether builds reuse cached dependencies and build artifacts.",
			default: false,
		})
		.option("build-command", {
			type: "string",
			description: "Command to build the Worker.",
		})
		.option("build-token-uuid", {
			type: "string",
			description: "UUID of the build token used when deploying the Worker.",
		})
		.option("deploy-command", {
			type: "string",
			description: "Command to deploy the Worker.",
		})
		.option("external-script-id", {
			type: "string",
			description:
				"System-generated tag of the Worker. This is not the Worker name.",
		})
		.option("path-excludes", {
			type: "string",
			array: true,
			description: "Path patterns that must not start builds.",
		})
		.option("path-includes", {
			type: "string",
			array: true,
			description: "Path patterns that can start builds.",
		})
		.option("repo-connection-uuid", {
			type: "string",
			description: "Repository connection UUID.",
		})
		.option("root-directory", {
			type: "string",
			description:
				"Repository directory in which build and deploy commands run.",
		})
		.option("trigger-name", {
			type: "string",
			description: "Human-readable name of the build trigger.",
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

type Request = SdkRequest<"createTrigger">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a build trigger",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds triggers create",
				classification: {
					safeFlags: ["build-caching-enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds triggers create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/triggers`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										branch_excludes: argv["branch-excludes"],
										branch_includes: argv["branch-includes"],
										build_caching_enabled: argv["build-caching-enabled"],
										build_command: resolveFileToken(
											argv["build-command"] as string | undefined,
											"build-command",
											"text"
										),
										build_token_uuid: resolveFileToken(
											argv["build-token-uuid"] as string | undefined,
											"build-token-uuid",
											"text"
										),
										deploy_command: resolveFileToken(
											argv["deploy-command"] as string | undefined,
											"deploy-command",
											"text"
										),
										external_script_id: resolveFileToken(
											argv["external-script-id"] as string | undefined,
											"external-script-id",
											"text"
										),
										path_excludes: argv["path-excludes"],
										path_includes: argv["path-includes"],
										repo_connection_uuid: resolveFileToken(
											argv["repo-connection-uuid"] as string | undefined,
											"repo-connection-uuid",
											"text"
										),
										root_directory: resolveFileToken(
											argv["root-directory"] as string | undefined,
											"root-directory",
											"text"
										),
										trigger_name: resolveFileToken(
											argv["trigger-name"] as string | undefined,
											"trigger-name",
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
						client.builds.triggers.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["branch-excludes"] === undefined) {
					throw new Error(
						"--branch-excludes is required (or pass --body with this field set)."
					);
				}
				if (argv["branch-includes"] === undefined) {
					throw new Error(
						"--branch-includes is required (or pass --body with this field set)."
					);
				}
				if (argv["build-command"] === undefined) {
					argv["build-command"] = await promptForRequiredField(
						"build-command",
						"Command to build the Worker."
					);
				}
				if (argv["build-token-uuid"] === undefined) {
					argv["build-token-uuid"] = await promptForRequiredField(
						"build-token-uuid",
						"UUID of the build token used when deploying the Worker."
					);
				}
				if (argv["deploy-command"] === undefined) {
					argv["deploy-command"] = await promptForRequiredField(
						"deploy-command",
						"Command to deploy the Worker."
					);
				}
				if (argv["external-script-id"] === undefined) {
					argv["external-script-id"] = await promptForRequiredField(
						"external-script-id",
						"System-generated tag of the Worker. This is not the Worker name."
					);
				}
				if (argv["path-excludes"] === undefined) {
					throw new Error(
						"--path-excludes is required (or pass --body with this field set)."
					);
				}
				if (argv["path-includes"] === undefined) {
					throw new Error(
						"--path-includes is required (or pass --body with this field set)."
					);
				}
				if (argv["repo-connection-uuid"] === undefined) {
					argv["repo-connection-uuid"] = await promptForRequiredField(
						"repo-connection-uuid",
						"Repository connection UUID."
					);
				}
				if (argv["root-directory"] === undefined) {
					argv["root-directory"] = await promptForRequiredField(
						"root-directory",
						"Repository directory in which build and deploy commands run."
					);
				}
				if (argv["trigger-name"] === undefined) {
					argv["trigger-name"] = await promptForRequiredField(
						"trigger-name",
						"Human-readable name of the build trigger."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					branch_excludes: argv["branch-excludes"],
					branch_includes: argv["branch-includes"],
					build_caching_enabled: argv["build-caching-enabled"],
					build_command: resolveFileToken(
						argv["build-command"] as string | undefined,
						"build-command",
						"text"
					),
					build_token_uuid: resolveFileToken(
						argv["build-token-uuid"] as string | undefined,
						"build-token-uuid",
						"text"
					),
					deploy_command: resolveFileToken(
						argv["deploy-command"] as string | undefined,
						"deploy-command",
						"text"
					),
					external_script_id: resolveFileToken(
						argv["external-script-id"] as string | undefined,
						"external-script-id",
						"text"
					),
					path_excludes: argv["path-excludes"],
					path_includes: argv["path-includes"],
					repo_connection_uuid: resolveFileToken(
						argv["repo-connection-uuid"] as string | undefined,
						"repo-connection-uuid",
						"text"
					),
					root_directory: resolveFileToken(
						argv["root-directory"] as string | undefined,
						"root-directory",
						"text"
					),
					trigger_name: resolveFileToken(
						argv["trigger-name"] as string | undefined,
						"trigger-name",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.builds.triggers.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
