import operation from "../../../_operations/cloudforce-one/scans/config/edit.js";
/**
 * edit command
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <config-id>",
	describe: "Update an existing Scan Config",
	usage:
		"$0 cloudforce-one scans config edit <config-id>\n\nUpdates an existing scan configuration in Cloudforce One's network scanning service.",
	flags: {
		frequency: {
			kind: "parsed",
			brief: "Defines the number of days between each scan (0 = One-off scan).",
			optional: true,
			parse: Number,
		},
		ips: {
			kind: "parsed",
			brief:
				"Defines a list of IP addresses or CIDR blocks to scan. The maximum number of total IP addresses allowed is 5000.",
			variadic: true,
			optional: true,
			parse: String,
		},
		ports: {
			kind: "parsed",
			brief:
				'Defines a list of ports to scan. Valid values are:"default", "all", or a comma-separated list of ports or range of ports (e.g. ["1-80", "443"]). "default" scans the 100 most commonly open ports.',
			variadic: true,
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
			placeholder: "config-id",
			brief: "Defines the Config ID.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one scans config edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
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
							config_id: argv["config-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					frequency: argv["frequency"],
					ips: argv["ips"],
					ports: argv["ports"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						config_id: argv["config-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
