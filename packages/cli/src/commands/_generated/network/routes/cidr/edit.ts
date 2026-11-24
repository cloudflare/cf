import operation from "../../../_operations/network/routes/cidr/edit.js";
/**
 * edit command
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
	command: "edit <route-id>",
	describe: "Update a tunnel route",
	usage:
		"$0 network routes cidr edit <route-id>\n\nUpdates an existing private network route in an account. The fields that are meant to be updated should be provided in the body of the request.",
	flags: {
		comment: {
			kind: "parsed",
			brief: "Optional remark describing the route.",
			optional: true,
			parse: String,
		},
		network: {
			kind: "parsed",
			brief:
				"The private IPv4 or IPv6 range connected by the route, in CIDR notation.",
			optional: true,
			parse: String,
		},
		"virtual-network-id": {
			kind: "parsed",
			brief: "UUID of the virtual network.",
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
		{ placeholder: "route-id", brief: "UUID of the route.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network routes cidr edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network routes cidr edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/teamnet/routes/${argv["route-id"] == null ? "<route-id>" : encodeURIComponent(String(argv["route-id"]))}`,
						pathParams: { "route-id": String(argv["route-id"] ?? "") },
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
										network: resolveFileToken(
											argv["network"] as string | undefined,
											"network",
											"text"
										),
										virtual_network_id: resolveFileToken(
											argv["virtual-network-id"] as string | undefined,
											"virtual-network-id",
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
							route_id: argv["route-id"],
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
					network: resolveFileToken(
						argv["network"] as string | undefined,
						"network",
						"text"
					),
					virtual_network_id: resolveFileToken(
						argv["virtual-network-id"] as string | undefined,
						"virtual-network-id",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						route_id: argv["route-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
