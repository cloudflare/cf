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
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals curated-feeds update <curated-feed-id>\n\nUpdate curated Threat Signals feed."
		)
		.positional("curated-feed-id", {
			type: "string",
			description: "Curated feed ID",
			demandOption: true,
		})
		.option("category-id", {
			type: "string",
			description:
				"One of the predefined Threat Signals feed categories; see GET /:account_id/v2/threat-signals/categories.",
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
		})
		.option("display-order", {
			type: "number",
			description: "The display_order field",
		})
		.option("is-active", {
			type: "boolean",
			description: "The is_active field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("url", { type: "string", description: "The url field" })
		.option("why-valuable", {
			type: "string",
			description: "The why_valuable field",
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

type Request = SdkRequest<"rssCuratedFeedUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <curated-feed-id>",
	describe: "Update curated Threat Signals feed",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals curated-feeds update",
				classification: {
					safeFlags: ["category-id", "is-active", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals curated-feeds update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/curated-feeds/${argv["curated-feed-id"] == null ? "<curated-feed-id>" : encodeURIComponent(String(argv["curated-feed-id"]))}`,
						pathParams: {
							"curated-feed-id": String(argv["curated-feed-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										category_id: resolveFileToken(
											argv["category-id"] as string | undefined,
											"category-id",
											"text"
										),
										display_order: argv["display-order"],
										is_active: argv["is-active"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
										why_valuable: resolveFileToken(
											argv["why-valuable"] as string | undefined,
											"why-valuable",
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
						client.cloudforceOne.threatSignals.curatedFeeds.update({
							...bodyData,
							account_id: accountId,
							curated_feed_id: argv["curated-feed-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					category_id: resolveFileToken(
						argv["category-id"] as string | undefined,
						"category-id",
						"text"
					),
					display_order: argv["display-order"],
					is_active: argv["is-active"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
					why_valuable: resolveFileToken(
						argv["why-valuable"] as string | undefined,
						"why-valuable",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.threatSignals.curatedFeeds.update({
						...bodyData,
						account_id: accountId,
						curated_feed_id: argv["curated-feed-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
