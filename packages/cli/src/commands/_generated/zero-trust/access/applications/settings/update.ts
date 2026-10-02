import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access applications settings update <app-id>\n\nUpdates Access application settings."
		)
		.positional("app-id", {
			type: "string",
			description: "App ID",
			demandOption: true,
		})
		.option("allow-iframe", {
			type: "boolean",
			description: "Enables loading application content in an iFrame.",
		})
		.option("skip-interstitial", {
			type: "boolean",
			description: "Enables automatic authentication through cloudflared.",
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

type Request =
	SdkRequest<"generated:put:/{account_or_zone}/{account_or_zone_id}/access/apps/{app_id}/settings">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <app-id>",
	describe: "Update Access application settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access applications settings update",
				classification: {
					safeFlags: ["allow-iframe", "skip-interstitial", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf zero-trust access applications settings update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/access/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/settings`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"app-id": String(argv["app-id"] ?? ""),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allow_iframe: argv["allow-iframe"],
										skip_interstitial: argv["skip-interstitial"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.access.applications.settings.update({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							app_id: argv["app-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allow_iframe: argv["allow-iframe"],
					skip_interstitial: argv["skip-interstitial"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.access.applications.settings.update({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						app_id: argv["app-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
