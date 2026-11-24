import operation from "../../_operations/images/config/edit.js";
/**
 * edit command
 * @generated from apis/overlays/images.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Update Images account configuration",
	usage:
		"$0 images config edit\n\nUpdate account-level Cloudflare Images settings. Only the settings included in the request are changed.",
	flags: {
		"flexible-variants": {
			kind: "boolean",
			brief:
				"Whether flexible variants are enabled. When `true`, hosted images can be transformed with options in the URL (for example `https://imagedelivery.net/<ACCOUNT_HASH>/<IMAGE_ID>/w=400,sharpen=3`) instead of only through named variants. When `false` or absent, only named variants can be requested.\n",
			optional: true,
		},
		"preserve-content-credentials": {
			kind: "boolean",
			brief:
				"Retain C2PA provenance metadata on images delivered from hosted Cloudflare Images. When enabled, Cloudflare keeps any existing Content Credentials in the source image and cryptographically signs the transformations it applies during delivery.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Settings to change. Settings omitted from the request are left unchanged.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images config edit",
				classification: {
					safeFlags: [
						"flexible-variants",
						"preserve-content-credentials",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images config edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1/config`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										flexible_variants: argv["flexible-variants"],
										preserve_content_credentials:
											argv["preserve-content-credentials"],
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					flexible_variants: argv["flexible-variants"],
					preserve_content_credentials: argv["preserve-content-credentials"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
