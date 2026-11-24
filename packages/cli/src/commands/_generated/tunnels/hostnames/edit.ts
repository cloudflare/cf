import operation from "../../_operations/tunnels/hostnames/edit.js";
/**
 * edit command
 * @generated from apis/overlays/tunnels.ts
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
	command: "edit <hostname-id>",
	describe: "Update a tunnel hostname",
	usage:
		"$0 tunnels hostnames edit <hostname-id>\n\nUpdates the hostname value or makes it canonical. To unset a canonical hostname, make a different hostname canonical instead.",
	flags: {
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			parse: String,
		},
		canonical: {
			kind: "boolean",
			brief:
				"Makes this hostname canonical. `false` is not accepted; make a different hostname canonical to unset this one.",
			optional: true,
		},
		hostname: {
			kind: "parsed",
			brief:
				"A single DNS label assigned to the tunnel. The value is normalized to lowercase and may contain only letters, digits, and internal hyphens.",
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
			placeholder: "hostname-id",
			brief: "UUID of the tunnel hostname.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels hostnames edit",
				classification: {
					safeFlags: ["canonical", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tunnels hostnames edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/tunnels/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/hostnames/${argv["hostname-id"] == null ? "<hostname-id>" : encodeURIComponent(String(argv["hostname-id"]))}`,
						pathParams: {
							"tunnel-id": String(argv["tunnel-id"] ?? ""),
							"hostname-id": String(argv["hostname-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										canonical: argv["canonical"],
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
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
							tunnel_id: argv["tunnel-id"],
							hostname_id: argv["hostname-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					canonical: argv["canonical"],
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
						hostname_id: argv["hostname-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
