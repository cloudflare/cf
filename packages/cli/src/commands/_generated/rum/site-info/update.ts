import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/rum.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 rum site-info update <site-id>\n\nUpdates an existing Web Analytics site."
		)
		.positional("site-id", {
			type: "string",
			description: "Identifier.",
			demandOption: true,
		})
		.option("auto-install", {
			type: "boolean",
			description:
				"If enabled, the JavaScript snippet is automatically injected for orange-clouded sites.",
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Enables or disables RUM. This option can be used only when auto_install is set to true.",
		})
		.option("host", {
			type: "string",
			description: "The hostname to use for gray-clouded sites.",
		})
		.option("lite", {
			type: "boolean",
			description:
				"If enabled, the JavaScript snippet will not be injected for visitors from the EU.",
		})
		.option("zone-tag", { type: "string", description: "The zone identifier." })
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

type Request = SdkRequest<"web-analytics-update-site">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <site-id>",
	describe: "Update a Web Analytics site",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rum site-info update",
				classification: {
					safeFlags: ["auto-install", "enabled", "lite", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rum site-info update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rum/site_info/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}`,
						pathParams: { "site-id": String(argv["site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										auto_install: argv["auto-install"],
										enabled: argv["enabled"],
										host: resolveFileToken(
											argv["host"] as string | undefined,
											"host",
											"text"
										),
										lite: argv["lite"],
										zone_tag: resolveFileToken(
											argv["zone-tag"] as string | undefined,
											"zone-tag",
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
						client.rum.siteInfo.update({
							...bodyData,
							account_id: accountId,
							site_id: argv["site-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					auto_install: argv["auto-install"],
					enabled: argv["enabled"],
					host: resolveFileToken(
						argv["host"] as string | undefined,
						"host",
						"text"
					),
					lite: argv["lite"],
					zone_tag: resolveFileToken(
						argv["zone-tag"] as string | undefined,
						"zone-tag",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.rum.siteInfo.update({
						...bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
