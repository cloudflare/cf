import operation from "../../../_operations/magic-transit/sites/netflow-config/edit.js";
/**
 * edit command
 * @generated from apis/overlays/magic-transit.ts
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
	command: "edit <site-id>",
	describe: "Update NetFlow Configuration",
	usage:
		"$0 magic-transit sites netflow-config edit <site-id>\n\nUpdates NetFlow configuration for a site.",
	flags: {
		"active-timeout": {
			kind: "parsed",
			brief: "Timeout in seconds for active flows.",
			optional: true,
			parse: Number,
		},
		"collector-ip": {
			kind: "parsed",
			brief: "IPv4 address of the NetFlow collector.",
			optional: true,
			parse: String,
		},
		"collector-port": {
			kind: "parsed",
			brief: "UDP port of the NetFlow collector.",
			optional: true,
			parse: Number,
		},
		"inactive-timeout": {
			kind: "parsed",
			brief: "Timeout in seconds for inactive flows.",
			optional: true,
			parse: Number,
		},
		"sampling-rate": {
			kind: "parsed",
			brief: "Sampling rate for NetFlow records (1 = every packet).",
			optional: true,
			parse: Number,
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
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites netflow-config edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
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
							site_id: argv["site-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
