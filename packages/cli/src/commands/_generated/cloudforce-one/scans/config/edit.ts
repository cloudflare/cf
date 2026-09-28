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
 * edit command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one scans config edit <config-id>\n\nUpdates an existing scan configuration in Cloudforce One's network scanning service."
		)
		.positional("config-id", {
			type: "string",
			description: "Defines the Config ID.",
			demandOption: true,
		})
		.option("frequency", {
			type: "number",
			description:
				"Defines the number of days between each scan (0 = One-off scan).",
		})
		.option("ips", {
			type: "string",
			array: true,
			description:
				"Defines a list of IP addresses or CIDR blocks to scan. The maximum number of total IP addresses allowed is 5000.",
		})
		.option("ports", {
			type: "string",
			array: true,
			description:
				'Defines a list of ports to scan. Valid values are:"default", "all", or a comma-separated list of ports or range of ports (e.g. ["1-80", "443"]). "default" scans the 100 most commonly open ports.',
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

type Request = SdkRequest<"post_ConfigUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <config-id>",
	describe: "Update an existing Scan Config",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one scans config edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one scans config edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/scans/config/${argv["config-id"] == null ? "<config-id>" : encodeURIComponent(String(argv["config-id"]))}`,
						pathParams: { "config-id": String(argv["config-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										frequency: argv["frequency"],
										ips: argv["ips"],
										ports: argv["ports"],
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
						client.cloudforceOne.scans.config.edit({
							...bodyData,
							account_id: accountId,
							config_id: argv["config-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					frequency: argv["frequency"],
					ips: argv["ips"],
					ports: argv["ports"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.scans.config.edit({
						...bodyData,
						account_id: accountId,
						config_id: argv["config-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
