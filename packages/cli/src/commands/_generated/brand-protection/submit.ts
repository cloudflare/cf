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
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * submit command
 * @generated from apis/overlays/brand-protection.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 brand-protection submit\n\nSubmit an image and find the n closest matches from the scanned images index without creating any match records. Returns similarity scores and metadata for each match."
		)
		.option("show-historic", {
			type: "string",
			description:
				"Include scanned images without domain metadata (historic data). Default: false (only show images with domain)",
		})
		.option("download", {
			type: "string",
			description: "If true, include base64-encoded image data in the response",
		})
		.option("image-data", {
			type: "string",
			description:
				"Base64 encoded image data. Can include data URI prefix (e.g., 'data:image/png;base64,...') or just the base64 string.",
		})
		.option("score-threshold", {
			type: "number",
			description:
				"Minimum similarity score threshold for matches (0-1, default: 0)",
			default: 0,
		})
		.option("top-k", {
			type: "number",
			description: "Number of closest matches to return (1-100, default: 10)",
			default: 10,
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

type Request = SdkRequest<"post_SearchLogoSimilarity">;
type Body = Request;
type Query = SdkQuery<"post_SearchLogoSimilarity">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "submit",
	describe: "Search scanned images",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "brand-protection submit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					showHistoric: argv["show-historic"],
					download: argv["download"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection submit",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/logo/search`,
						pathParams: {},
						query: queryParams,
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
										score_threshold: argv["score-threshold"],
										top_k: argv["top-k"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.brandProtection.submit({
							...bodyData,
							account_id: accountId,
							...queryParams,
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					image_data: resolveFileToken(
						argv["image-data"] as string | undefined,
						"image-data",
						"text"
					),
					score_threshold: argv["score-threshold"],
					top_k: argv["top-k"],
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.brandProtection.submit({
						...bodyData,
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
