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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit sites app-configuration create <site-id>\n\nCreates a new App Config for a site"
		)
		.positional("site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("breakout", {
			type: "boolean",
			description:
				"Whether to breakout traffic to the app's endpoints directly. Null preserves default behavior.",
		})
		.option("preferred-wans", {
			type: "string",
			array: true,
			description:
				"WAN interfaces to prefer over default WANs, highest-priority first. Can only be specified for breakout rules (breakout must be true).",
		})
		.option("priority", {
			type: "number",
			description:
				"Priority of traffic. 0 is default, anything greater is prioritized. (Currently only 0 and 1 are supported)",
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

type Request = SdkRequest<"magic-site-app-configs-add-app-config">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <site-id>",
	describe: "Create a new App Config",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites app-configuration create",
				classification: {
					safeFlags: ["breakout", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites app-configuration create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/app_configs`,
						pathParams: { "site-id": String(argv["site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										breakout: argv["breakout"],
										preferred_wans: argv["preferred-wans"],
										priority: argv["priority"],
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
						client.magicTransit.sites.appConfiguration.create({
							...bodyData,
							account_id: accountId,
							site_id: argv["site-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					breakout: argv["breakout"],
					preferred_wans: argv["preferred-wans"],
					priority: argv["priority"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.magicTransit.sites.appConfiguration.create({
						...bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
