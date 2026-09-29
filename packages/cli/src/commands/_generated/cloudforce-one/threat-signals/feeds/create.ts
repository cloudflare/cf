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
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals feeds create\n\nSubscribes the account to a custom or curated Threat Signals feed."
		)
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
		.option("curated-feed-id", {
			type: "string",
			description: "The curated_feed_id field",
		})
		.option("display-name", {
			type: "string",
			description: "The display_name field",
		})
		.option("enabled", {
			type: "boolean",
			description: "The enabled field",
			default: true,
		})
		.option("poll-interval-s", {
			type: "number",
			description: "The poll_interval_s field",
			default: 300,
		})
		.option("title", { type: "string", description: "The title field" })
		.option("url", { type: "string", description: "The url field" })
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

type Request = SdkRequest<"rssFeedCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Threat Signals feed",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals feeds create",
				classification: {
					safeFlags: ["category-id", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals feeds create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/feeds`,
						pathParams: {},
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
										curated_feed_id: resolveFileToken(
											argv["curated-feed-id"] as string | undefined,
											"curated-feed-id",
											"text"
										),
										display_name: resolveFileToken(
											argv["display-name"] as string | undefined,
											"display-name",
											"text"
										),
										enabled: argv["enabled"],
										poll_interval_s: argv["poll-interval-s"],
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
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
						client.cloudforceOne.threatSignals.feeds.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					category_id: resolveFileToken(
						argv["category-id"] as string | undefined,
						"category-id",
						"text"
					),
					curated_feed_id: resolveFileToken(
						argv["curated-feed-id"] as string | undefined,
						"curated-feed-id",
						"text"
					),
					display_name: resolveFileToken(
						argv["display-name"] as string | undefined,
						"display-name",
						"text"
					),
					enabled: argv["enabled"],
					poll_interval_s: argv["poll-interval-s"],
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.threatSignals.feeds.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
