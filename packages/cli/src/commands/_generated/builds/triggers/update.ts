import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
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
			"$0 builds triggers update <trigger-uuid>\n\nUpdate commands, cache settings, or branch and path filters for a trigger."
		)
		.positional("trigger-uuid", {
			type: "string",
			description: "Trigger UUID.",
			demandOption: true,
		})
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

type Request = SdkRequest<"updateTrigger">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <trigger-uuid>",
	describe: "Update a build trigger",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds triggers update",
				classification: {
					safeFlags: ["build-caching-enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds triggers update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/triggers/${argv["trigger-uuid"] == null ? "<trigger-uuid>" : encodeURIComponent(String(argv["trigger-uuid"]))}`,
						pathParams: { "trigger-uuid": String(argv["trigger-uuid"] ?? "") },
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
										path_excludes: argv["path-excludes"],
										path_includes: argv["path-includes"],
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
					const result = await withProgress(`Updating`, async () =>
						client.builds.triggers.update({
							...bodyData,
							account_id: accountId,
							trigger_uuid: argv["trigger-uuid"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
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
					path_excludes: argv["path-excludes"],
					path_includes: argv["path-includes"],
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
				const result = await withProgress(`Updating`, async () =>
					client.builds.triggers.update({
						...bodyData,
						account_id: accountId,
						trigger_uuid: argv["trigger-uuid"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
