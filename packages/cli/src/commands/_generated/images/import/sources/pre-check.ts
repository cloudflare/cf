import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * pre-check command
 * @generated from apis/overlays/images.ts
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
			"$0 images import sources pre-check\n\nCheck S3 credentials without saving a source."
		)
		.option("account", {
			type: "string",
			description:
				"Account identifier for the bucket (required for R2 vendor).",
		})
		.option("bucket", {
			type: "string",
			description: "The name of the storage bucket.",
		})
		.option("region", {
			type: "string",
			description: "The region hint for the bucket (S3 only).",
		})
		.option("vendor", {
			type: "string",
			description: "The cloud storage vendor of the source bucket.",
			choices: ["s3", "r2"],
		})
		.coerce("vendor", (value: string | undefined) =>
			resolveFileToken(value, "vendor", "text")
		)
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

type Request =
	SdkRequest<"cloudflare-images-sourcingkit-precheck-source-connectivity">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "pre-check",
	describe: "Precheck source connectivity",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images import sources pre-check",
				classification: {
					safeFlags: ["vendor", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images import sources pre-check",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v2/sourcingkit/sources/connectivity-precheck`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										account: resolveFileToken(
											argv["account"] as string | undefined,
											"account",
											"text"
										),
										bucket: resolveFileToken(
											argv["bucket"] as string | undefined,
											"bucket",
											"text"
										),
										region: resolveFileToken(
											argv["region"] as string | undefined,
											"region",
											"text"
										),
										vendor: argv["vendor"],
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
						client.images.import.sources.preCheck({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["bucket"] === undefined) {
					argv["bucket"] = await promptForRequiredField(
						"bucket",
						"The name of the storage bucket."
					);
				}
				if (argv["vendor"] === undefined) {
					argv["vendor"] = await promptForRequiredEnumField(
						"vendor",
						"The cloud storage vendor of the source bucket.",
						["s3", "r2"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					account: resolveFileToken(
						argv["account"] as string | undefined,
						"account",
						"text"
					),
					bucket: resolveFileToken(
						argv["bucket"] as string | undefined,
						"bucket",
						"text"
					),
					region: resolveFileToken(
						argv["region"] as string | undefined,
						"region",
						"text"
					),
					vendor: argv["vendor"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.images.import.sources.preCheck({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
