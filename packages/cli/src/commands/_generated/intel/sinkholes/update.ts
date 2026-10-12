import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/intel.ts
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
			"$0 intel sinkholes update <sinkhole-id>\n\nReplaces the name or R2 configuration of the specified sinkhole. This is a full replacement. All fields, including r2_secret, must be re-supplied. Omitting r2_secret overwrites the stored value with an empty string."
		)
		.positional("sinkhole-id", {
			type: "string",
			description: "The unique identifier for the sinkhole.",
			demandOption: true,
		})
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

type Request = SdkRequest<"sinkhole-config-update-sinkhole">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <sinkhole-id>",
	describe: "Update a sinkhole",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel sinkholes update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel sinkholes update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/sinkholes/${argv["sinkhole-id"] == null ? "<sinkhole-id>" : encodeURIComponent(String(argv["sinkhole-id"]))}`,
						pathParams: { "sinkhole-id": String(argv["sinkhole-id"] ?? "") },
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
					const result = await withProgress(`Updating`, async () =>
						client.intel.sinkholes.update({
							body: bodyData,
							account_id: accountId,
							sinkhole_id: argv["sinkhole-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
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
				const result = await withProgress(`Updating`, async () =>
					client.intel.sinkholes.update({
						body: bodyData,
						account_id: accountId,
						sinkhole_id: argv["sinkhole-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
