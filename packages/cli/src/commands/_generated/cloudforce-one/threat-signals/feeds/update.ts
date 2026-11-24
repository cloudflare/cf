import operation from "../../../_operations/cloudforce-one/threat-signals/feeds/update.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
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
	describe: "Update Threat Signals feed",
	usage:
		"$0 cloudforce-one threat-signals feeds update <feed-id>\n\nUpdates a Threat Signals feed subscription.",
	flags: {
		"category-id": {
			kind: "parsed",
			brief:
				"One of the predefined Threat Signals feed categories; see GET /:account_id/v2/threat-signals/categories.",
			optional: true,
			choices: [
				"b12a0fd6-f7b9-5393-9ef3-f888d506c550",
				"d5b70eaa-626f-5761-b55b-6d9590df49fb",
				"3b572d2b-890d-5286-9433-f18c85079030",
				"17f90d3b-37d3-5241-8ad4-7d6abbc2006c",
				"c68f28e9-7e8f-5d4b-853b-f3076893a9ee",
				"bb0e4a94-38ab-5c14-80a7-28cee9f4b139",
				"b1ef66d9-a73c-58dc-b269-22d34dfd11f4",
				"ab02a976-0a20-5c76-a553-7f6325afacfe",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "category-id", "text"),
		},
		"display-name": {
			kind: "parsed",
			brief:
				"Override the feed's display name. Null clears it; omit to keep existing or derived value.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether to actively poll the feed. Omit to keep current value.",
			optional: true,
		},
		"poll-interval-s": {
			kind: "parsed",
			brief:
				"New polling interval in seconds (60-86400). Omit to keep current value.",
			optional: true,
			parse: Number,
		},
		"tagging-enabled": {
			kind: "boolean",
			brief:
				"When enabled, new articles from this feed are tagged automatically by AI. Changes apply to articles processed afterwards. Omit to keep current value.",
			optional: true,
		},
		title: {
			kind: "parsed",
			brief:
				"Override the feed's title. Null clears it; omit to keep existing or derived value.",
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
		{
			placeholder: "feed-id",
			brief: "UUID of the Threat Signals feed",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals feeds update",
				classification: {
					safeFlags: ["category-id", "enabled", "tagging-enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals feeds update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/feeds/${argv["feed-id"] == null ? "<feed-id>" : encodeURIComponent(String(argv["feed-id"]))}`,
						pathParams: { "feed-id": String(argv["feed-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										category_id: argv["category-id"],
										display_name: resolveFileToken(
											argv["display-name"] as string | undefined,
											"display-name",
											"text"
										),
										enabled: argv["enabled"],
										poll_interval_s: argv["poll-interval-s"],
										tagging_enabled: argv["tagging-enabled"],
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
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
					category_id: argv["category-id"],
					display_name: resolveFileToken(
						argv["display-name"] as string | undefined,
						"display-name",
						"text"
					),
					enabled: argv["enabled"],
					poll_interval_s: argv["poll-interval-s"],
					tagging_enabled: argv["tagging-enabled"],
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
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
