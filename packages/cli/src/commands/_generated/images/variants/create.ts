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
 * create command
 * @generated from apis/overlays/images.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 images variants create\n\nCreate a CF Images variant that allows you to resize images for different use cases."
		)
		.option("id", { type: "string", description: "The id field" })
		.option("never-require-signed-urls", {
			type: "boolean",
			description:
				"Indicates whether the variant can access an image without a signature, regardless of image access control.",
			default: false,
		})
		.option("options-fit", {
			type: "string",
			description:
				"The fit property describes how the width and height dimensions should be interpreted.",
			choices: ["scale-down", "contain", "cover", "crop", "pad"],
		})
		.option("options-height", {
			type: "number",
			description: "Maximum height in image pixels.",
		})
		.option("options-metadata", {
			type: "string",
			description: "What EXIF data should be preserved in the output image.",
			choices: ["keep", "copyright", "none"],
		})
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

type Request = SdkRequest<"cloudflare-images-variants-create-a-variant">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a variant",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images variants create",
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
						command: "cf images variants create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1/variants`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										neverRequireSignedURLs: argv["never-require-signed-urls"],
										options: {
											fit: resolveFileToken(
												argv["options-fit"] as string | undefined,
												"options-fit",
												"text"
											),
											height: argv["options-height"],
											metadata: resolveFileToken(
												argv["options-metadata"] as string | undefined,
												"options-metadata",
												"text"
											),
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.images.variants.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["id"] === undefined) {
					argv["id"] = await promptForRequiredField("id", "The id field");
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
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					neverRequireSignedURLs: argv["never-require-signed-urls"],
					options: {
						fit: resolveFileToken(
							argv["options-fit"] as string | undefined,
							"options-fit",
							"text"
						),
						height: argv["options-height"],
						metadata: resolveFileToken(
							argv["options-metadata"] as string | undefined,
							"options-metadata",
							"text"
						),
						width: argv["options-width"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.images.variants.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
