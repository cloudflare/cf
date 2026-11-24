import operation from "../../_operations/intel/indicator-feeds/update.js";
/**
 * update command
 * @generated from apis/overlays/intel.ts
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
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <feed-id>",
	describe: "Update indicator feed metadata",
	usage:
		"$0 intel indicator-feeds update <feed-id>\n\nRevises details for a specific custom threat indicator feed.",
	flags: {
		description: {
			kind: "parsed",
			brief: "The new description of the feed",
			optional: true,
			parse: String,
		},
		"is-attributable": {
			kind: "boolean",
			brief: "The new is_attributable value of the feed",
			optional: true,
		},
		"is-downloadable": {
			kind: "boolean",
			brief: "The new is_downloadable value of the feed",
			optional: true,
		},
		"is-public": {
			kind: "boolean",
			brief: "The new is_public value of the feed",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The new name of the feed",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "feed-id", brief: "Indicator feed ID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel indicator-feeds update",
				classification: {
					safeFlags: [
						"is-attributable",
						"is-downloadable",
						"is-public",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel indicator-feeds update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/indicator-feeds/${argv["feed-id"] == null ? "<feed-id>" : encodeURIComponent(String(argv["feed-id"]))}`,
						pathParams: { "feed-id": String(argv["feed-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										is_attributable: argv["is-attributable"],
										is_downloadable: argv["is-downloadable"],
										is_public: argv["is-public"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
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
							feed_id: argv["feed-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					is_attributable: argv["is-attributable"],
					is_downloadable: argv["is-downloadable"],
					is_public: argv["is-public"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						feed_id: argv["feed-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
