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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel indicator-feeds update <feed-id>\n\nRevises details for a specific custom threat indicator feed."
		)
		.positional("feed-id", {
			type: "string",
			description: "Indicator feed ID",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "The new description of the feed",
		})
		.option("is-attributable", {
			type: "boolean",
			description: "The new is_attributable value of the feed",
		})
		.option("is-downloadable", {
			type: "boolean",
			description: "The new is_downloadable value of the feed",
		})
		.option("is-public", {
			type: "boolean",
			description: "The new is_public value of the feed",
		})
		.option("name", { type: "string", description: "The new name of the feed" })
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
	SdkRequest<"custom-indicator-feeds-update-indicator-feed-metadata">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <feed-id>",
	describe: "Update indicator feed metadata",
	builder,
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
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.intel.indicatorFeeds.update({
							...bodyData,
							account_id: accountId,
							feed_id: argv["feed-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.intel.indicatorFeeds.update({
						...bodyData,
						account_id: accountId,
						feed_id: argv["feed-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
