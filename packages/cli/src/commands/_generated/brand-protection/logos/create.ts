import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/brand-protection.ts
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
			"$0 brand-protection logos create\n\nCreate a new saved brand protection logo query for visual similarity matching"
		)
		.option("image-data", {
			type: "string",
			description:
				"Base64 encoded image data. Can include data URI prefix (e.g., 'data:image/png;base64,...') or just the base64 string.",
		})
		.option("search-lookback", {
			type: "boolean",
			description:
				"If true, search historic scanned images for matches above the similarity threshold",
			default: true,
		})
		.option("similarity-threshold", {
			type: "number",
			description: "Minimum similarity score (0-1) required for visual matches",
		})
		.option("tag", {
			type: "string",
			description: "Unique identifier for the logo query",
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

type Request = SdkRequest<"post_InsertLogoQuery">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Insert logo query",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "brand-protection logos create",
				classification: {
					safeFlags: ["search-lookback", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection logos create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/logo/queries`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										image_data: resolveFileToken(
											argv["image-data"] as string | undefined,
											"image-data",
											"text"
										),
										search_lookback: argv["search-lookback"],
										similarity_threshold: argv["similarity-threshold"],
										tag: resolveFileToken(
											argv["tag"] as string | undefined,
											"tag",
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
						client.brandProtection.logos.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["image-data"] === undefined) {
					argv["image-data"] = await promptForRequiredField(
						"image-data",
						"Base64 encoded image data. Can include data URI prefix (e.g., 'data:image/png;base64,...') or just the base64 string."
					);
				}
				if (argv["similarity-threshold"] === undefined) {
					throw new Error(
						"--similarity-threshold is required (or pass --body with this field set)."
					);
				}
				if (argv["tag"] === undefined) {
					argv["tag"] = await promptForRequiredField(
						"tag",
						"Unique identifier for the logo query"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					image_data: resolveFileToken(
						argv["image-data"] as string | undefined,
						"image-data",
						"text"
					),
					search_lookback: argv["search-lookback"],
					similarity_threshold: argv["similarity-threshold"],
					tag: resolveFileToken(
						argv["tag"] as string | undefined,
						"tag",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.brandProtection.logos.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
