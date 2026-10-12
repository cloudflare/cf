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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 builds tokens create\n\nCreate a new build authentication token")
		.option("build-token-name", {
			type: "string",
			description: "The build_token_name field",
		})
		.option("build-token-secret", {
			type: "string",
			description: "The build_token_secret field",
		})
		.option("cloudflare-token-id", {
			type: "string",
			description: "The cloudflare_token_id field",
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

type Request = SdkRequest<"createBuildToken">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create build token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds tokens create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/tokens`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										build_token_name: resolveFileToken(
											argv["build-token-name"] as string | undefined,
											"build-token-name",
											"text"
										),
										build_token_secret: resolveFileToken(
											argv["build-token-secret"] as string | undefined,
											"build-token-secret",
											"text"
										),
										cloudflare_token_id: resolveFileToken(
											argv["cloudflare-token-id"] as string | undefined,
											"cloudflare-token-id",
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
						client.builds.tokens.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["build-token-name"] === undefined) {
					argv["build-token-name"] = await promptForRequiredField(
						"build-token-name",
						"The build_token_name field"
					);
				}
				if (argv["build-token-secret"] === undefined) {
					argv["build-token-secret"] = await promptForRequiredField(
						"build-token-secret",
						"The build_token_secret field"
					);
				}
				if (argv["cloudflare-token-id"] === undefined) {
					argv["cloudflare-token-id"] = await promptForRequiredField(
						"cloudflare-token-id",
						"The cloudflare_token_id field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					build_token_name: resolveFileToken(
						argv["build-token-name"] as string | undefined,
						"build-token-name",
						"text"
					),
					build_token_secret: resolveFileToken(
						argv["build-token-secret"] as string | undefined,
						"build-token-secret",
						"text"
					),
					cloudflare_token_id: resolveFileToken(
						argv["cloudflare-token-id"] as string | undefined,
						"cloudflare-token-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.builds.tokens.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
