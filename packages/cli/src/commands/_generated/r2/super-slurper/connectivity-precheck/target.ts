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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * target command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 super-slurper connectivity-precheck target\n\nCheck whether tokens are valid against the target bucket"
		)
		.option("bucket", { type: "string", description: "The bucket field" })
		.option("jurisdiction", {
			type: "string",
			description: "The jurisdiction field",
			choices: ["default", "eu", "us", "fedramp"],
		})
		.option("secret-access-key-id", {
			type: "string",
			description: "The secret.accessKeyId field",
		})
		.option("secret-secret-access-key", {
			type: "string",
			description: "The secret.secretAccessKey field",
		})
		.option("vendor", {
			type: "string",
			description: "The vendor field",
			choices: ["r2"],
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

type Request = SdkRequest<"slurper-check-target-connectivity">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "target",
	describe: "Check target connectivity",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 super-slurper connectivity-precheck target",
				classification: {
					safeFlags: ["jurisdiction", "vendor", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 super-slurper connectivity-precheck target",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/slurper/target/connectivity-precheck`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bucket: resolveFileToken(
											argv["bucket"] as string | undefined,
											"bucket",
											"text"
										),
										jurisdiction: resolveFileToken(
											argv["jurisdiction"] as string | undefined,
											"jurisdiction",
											"text"
										),
										secret: {
											accessKeyId: resolveFileToken(
												argv["secret-access-key-id"] as string | undefined,
												"secret-access-key-id",
												"text"
											),
											secretAccessKey: resolveFileToken(
												argv["secret-secret-access-key"] as string | undefined,
												"secret-secret-access-key",
												"text"
											),
										},
										vendor: resolveFileToken(
											argv["vendor"] as string | undefined,
											"vendor",
											"text"
										),
									}),
						sensitiveBodyPaths: [["secret", "secretAccessKey"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.r2.superSlurper.connectivityPrecheck.target({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["bucket"] === undefined) {
					argv["bucket"] = await promptForRequiredField(
						"bucket",
						"The bucket field"
					);
				}
				if (argv["secret-access-key-id"] === undefined) {
					argv["secret-access-key-id"] = await promptForRequiredField(
						"secret-access-key-id",
						"The secret.accessKeyId field"
					);
				}
				if (argv["secret-secret-access-key"] === undefined) {
					argv["secret-secret-access-key"] = await promptForRequiredField(
						"secret-secret-access-key",
						"The secret.secretAccessKey field",
						{ kind: "secret" }
					);
				}
				if (argv["vendor"] === undefined) {
					argv["vendor"] = await promptForRequiredEnumField(
						"vendor",
						"The vendor field",
						["r2"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					bucket: resolveFileToken(
						argv["bucket"] as string | undefined,
						"bucket",
						"text"
					),
					jurisdiction: resolveFileToken(
						argv["jurisdiction"] as string | undefined,
						"jurisdiction",
						"text"
					),
					secret: {
						accessKeyId: resolveFileToken(
							argv["secret-access-key-id"] as string | undefined,
							"secret-access-key-id",
							"text"
						),
						secretAccessKey: resolveFileToken(
							argv["secret-secret-access-key"] as string | undefined,
							"secret-secret-access-key",
							"text"
						),
					},
					vendor: resolveFileToken(
						argv["vendor"] as string | undefined,
						"vendor",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.r2.superSlurper.connectivityPrecheck.target({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
