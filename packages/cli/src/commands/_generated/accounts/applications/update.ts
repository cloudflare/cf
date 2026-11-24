import operation from "../../_operations/accounts/applications/update.js";
/**
 * update command
 * @generated from apis/overlays/accounts.ts
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
	command: "update <id>",
	describe: "Update application",
	usage:
		"$0 accounts applications update <id>\n\nReplace the supplied network matchers for a custom application and create a new version. Omitted matcher lists remain unchanged; send an empty list to clear a matcher type.",
	flags: {
		hostnames: {
			kind: "parsed",
			brief: "Hostnames matched by the application.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ip-subnets": {
			kind: "parsed",
			brief:
				"IP subnets for this application. Custom application create and update requests accept IPv4 prefix lengths /8 through /32 and IPv6 prefix lengths /32 through /128.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"port-protocols": {
			kind: "parsed",
			brief:
				"Ports matched by the application, in `protocol/port` or inclusive `protocol/start-end` format (for example, `tcp/443` or `udp/10000-20000`). TCP and UDP ports must be between 0 and 65535.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"support-domains": {
			kind: "parsed",
			brief: "Support domains matched by the application.",
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
			brief:
				"Update the network matchers for the application. The service preserves omitted matcher lists; send an empty array to clear a list. The resulting application must contain at least one hostname or IP subnet. Support domains and port/protocol pairs do not satisfy this requirement. A NUL character (U+0000) in any string value returns `400`. ",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "id", brief: "Application ID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts applications update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts applications update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/resource-library/applications/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										hostnames: argv["hostnames"],
										ip_subnets: argv["ip-subnets"],
										port_protocols: argv["port-protocols"],
										support_domains: argv["support-domains"],
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
							id: argv["id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					hostnames: argv["hostnames"],
					ip_subnets: argv["ip-subnets"],
					port_protocols: argv["port-protocols"],
					support_domains: argv["support-domains"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
