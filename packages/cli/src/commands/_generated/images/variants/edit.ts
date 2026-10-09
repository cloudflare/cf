import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 images variants edit <variant-id>\n\nUpdate a CF Images variant. This will purge the cache for all images associated with the variant."
		)
		.positional("variant-id", {
			type: "string",
			description: "Variant ID",
			demandOption: true,
		})
		.option("never-require-signed-urls", {
			type: "boolean",
			description:
				"Indicates whether the variant can access an image without a signature, regardless of image access control.",
		})
		.option("options-fit", {
			type: "string",
			description:
				"The fit property describes how the width and height dimensions should be interpreted.",
			choices: ["scale-down", "contain", "cover", "crop", "pad"],
		})
		.coerce("options-fit", (value) =>
			resolveFileToken(value, "options-fit", "text")
		)
		.option("options-height", {
			type: "number",
			description: "Maximum height in image pixels.",
		})
		.option("options-metadata", {
			type: "string",
			description: "What EXIF data should be preserved in the output image.",
			choices: ["keep", "copyright", "none"],
		})
		.coerce("options-metadata", (value) =>
			resolveFileToken(value, "options-metadata", "text")
		)
		.option("options-width", {
			type: "number",
			description: "Maximum width in image pixels.",
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

type Request = SdkRequest<"cloudflare-images-variants-update-a-variant">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <variant-id>",
	describe: "Update a variant",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images variants edit",
				classification: {
					safeFlags: [
						"never-require-signed-urls",
						"options-fit",
						"options-metadata",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images variants edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1/variants/${argv["variant-id"] == null ? "<variant-id>" : encodeURIComponent(String(argv["variant-id"]))}`,
						pathParams: { "variant-id": String(argv["variant-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										neverRequireSignedURLs: argv["never-require-signed-urls"],
										options: {
											fit: argv["options-fit"],
											height: argv["options-height"],
											metadata: argv["options-metadata"],
											width: argv["options-width"],
										},
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
						client.images.variants.edit({
							...bodyData,
							account_id: accountId,
							variant_id: argv["variant-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["options-fit"] === undefined) {
					argv["options-fit"] = await promptForRequiredEnumField(
						"options-fit",
						"The fit property describes how the width and height dimensions should be interpreted.",
						["scale-down", "contain", "cover", "crop", "pad"] as const
					);
				}
				if (argv["options-height"] === undefined) {
					throw new Error(
						"--options-height is required (or pass --body with this field set)."
					);
				}
				if (argv["options-metadata"] === undefined) {
					argv["options-metadata"] = await promptForRequiredEnumField(
						"options-metadata",
						"What EXIF data should be preserved in the output image.",
						["keep", "copyright", "none"] as const
					);
				}
				if (argv["options-width"] === undefined) {
					throw new Error(
						"--options-width is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					neverRequireSignedURLs: argv["never-require-signed-urls"],
					options: {
						fit: argv["options-fit"],
						height: argv["options-height"],
						metadata: argv["options-metadata"],
						width: argv["options-width"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.images.variants.edit({
						...bodyData,
						account_id: accountId,
						variant_id: argv["variant-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
