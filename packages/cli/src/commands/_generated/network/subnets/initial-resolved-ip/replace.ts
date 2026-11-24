import operation from "../../../_operations/network/subnets/initial-resolved-ip/replace.js";
/**
 * replace command
 * @generated from apis/overlays/network.ts
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
	command: "replace <address-family>",
	describe: "Update Initial Resolved IP Subnet",
	usage:
		"$0 network subnets initial-resolved-ip replace <address-family>\n\nUpdates the CIDR for the account's default Initial Resolved IP Subnet of the given address family. The new CIDR must not conflict with existing private routes in the account.",
	flags: {
		comment: {
			kind: "parsed",
			brief: "An optional description of the subnet.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the subnet.",
			optional: true,
			parse: String,
		},
		network: {
			kind: "parsed",
			brief:
				"The private IPv4 or IPv6 range defining the subnet, in CIDR notation.",
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
			placeholder: "address-family",
			brief: "IP address family, either \`v4\` (IPv4) or \`v6\` (IPv6)",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network subnets initial-resolved-ip replace",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network subnets initial-resolved-ip replace",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/subnets/initial_resolved_ip/${argv["address-family"] == null ? "<address-family>" : encodeURIComponent(String(argv["address-family"]))}`,
						pathParams: {
							"address-family": String(argv["address-family"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comment: resolveFileToken(
											argv["comment"] as string | undefined,
											"comment",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										network: resolveFileToken(
											argv["network"] as string | undefined,
											"network",
											"text"
										),
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
							address_family: argv["address-family"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					network: resolveFileToken(
						argv["network"] as string | undefined,
						"network",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						address_family: argv["address-family"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
