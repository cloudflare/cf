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
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel sinkholes create\n\nCreate a new sinkhole. Logs of large request bodies will be truncated, but the full request body can be recorded in R2. If you wish to record large request bodies in R2, include the R2 key ID, key secret, and bucket name in the request body."
		)
		.option("name", {
			type: "string",
			description: "The name of the sinkhole.",
		})
		.option("r2-bucket", {
			type: "string",
			description:
				"The name of the R2 bucket to store results. Required if you want to store large request bodies in R2.",
		})
		.option("r2-id", {
			type: "string",
			description:
				"The id of the R2 instance. Required if you want to store large request bodies in R2.",
		})
		.option("r2-secret", {
			type: "string",
			description:
				"The secret key for the R2 API token. Required if you want to store large request bodies in R2.",
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

type Request = SdkRequest<"sinkhole-config-create-sinkhole">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a new sinkhole for your account",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel sinkholes create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel sinkholes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/sinkholes`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										r2_bucket: resolveFileToken(
											argv["r2-bucket"] as string | undefined,
											"r2-bucket",
											"text"
										),
										r2_id: resolveFileToken(
											argv["r2-id"] as string | undefined,
											"r2-id",
											"text"
										),
										r2_secret: resolveFileToken(
											argv["r2-secret"] as string | undefined,
											"r2-secret",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.intel.sinkholes.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the sinkhole."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					r2_bucket: resolveFileToken(
						argv["r2-bucket"] as string | undefined,
						"r2-bucket",
						"text"
					),
					r2_id: resolveFileToken(
						argv["r2-id"] as string | undefined,
						"r2-id",
						"text"
					),
					r2_secret: resolveFileToken(
						argv["r2-secret"] as string | undefined,
						"r2-secret",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.intel.sinkholes.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
