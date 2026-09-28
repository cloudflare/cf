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
 * edit command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit sites netflow-config edit <site-id>\n\nUpdates NetFlow configuration for a site."
		)
		.positional("site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("active-timeout", {
			type: "number",
			description: "Timeout in seconds for active flows.",
		})
		.option("collector-ip", {
			type: "string",
			description: "IPv4 address of the NetFlow collector.",
		})
		.option("collector-port", {
			type: "number",
			description: "UDP port of the NetFlow collector.",
		})
		.option("inactive-timeout", {
			type: "number",
			description: "Timeout in seconds for inactive flows.",
		})
		.option("sampling-rate", {
			type: "number",
			description: "Sampling rate for NetFlow records (1 = every packet).",
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

type Request = SdkRequest<"magic-site-netflow-config-patch-netflow-config">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <site-id>",
	describe: "Update NetFlow Configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites netflow-config edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites netflow-config edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/netflow_config`,
						pathParams: { "site-id": String(argv["site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										active_timeout: argv["active-timeout"],
										collector_ip: resolveFileToken(
											argv["collector-ip"] as string | undefined,
											"collector-ip",
											"text"
										),
										collector_port: argv["collector-port"],
										inactive_timeout: argv["inactive-timeout"],
										sampling_rate: argv["sampling-rate"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.sites.netflowConfig.edit({
							body: bodyData,
							account_id: accountId,
							site_id: argv["site-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					active_timeout: argv["active-timeout"],
					collector_ip: resolveFileToken(
						argv["collector-ip"] as string | undefined,
						"collector-ip",
						"text"
					),
					collector_port: argv["collector-port"],
					inactive_timeout: argv["inactive-timeout"],
					sampling_rate: argv["sampling-rate"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.sites.netflowConfig.edit({
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
