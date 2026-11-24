import operation from "../../_operations/images/variants/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "images variants edit",
			classification: {
				safeFlags: [
					"never-require-signed-urls",
					"options-fit",
					"options-metadata",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
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
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						variant_id: argv["variant-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				neverRequireSignedURLs: argv["never-require-signed-urls"],
				options: {
					fit: argv["options-fit"],
					height: argv["options-height"],
					metadata: argv["options-metadata"],
					width: argv["options-width"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					variant_id: argv["variant-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
