import operation from "../../../_operations/network/subnets/warp/create.js";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create WARP IP subnet",
	usage:
		"$0 network subnets warp create\n\nCreate a WARP IP assignment subnet. Currently, only IPv4 subnets can be created. **Network constraints:** - The network must be within one of the following private IP ranges: - `10.0.0.0/8` (RFC 1918) - `172.16.0.0/12` (RFC 1918) - `192.168.0.0/16` (RFC 1918) - `100.64.0.0/10` (RFC 6598 - CGNAT) - The subnet must have a prefix length of `/24` or larger (e.g., `/16`, `/20`, `/24` are valid; `/25`, `/28` are not)",
	flags: {
		comment: {
			kind: "parsed",
			brief: "An optional description of the subnet.",
			default: "",
			parse: String,
		},
		"is-default-network": {
			kind: "boolean",
			brief:
				"If `true`, this is the default subnet for the account. There can only be one default subnet per account.",
			default: false,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network subnets warp create",
				classification: {
					safeFlags: ["is-default-network", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"A user-friendly name for the subnet."
						);
					}
					if (argv["network"] === undefined) {
						argv["network"] = await promptForRequiredField(
							"network",
							"The private IPv4 or IPv6 range defining the subnet, in CIDR notation."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network subnets warp create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/subnets/warp`,
						pathParams: {},
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
										is_default_network: argv["is-default-network"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					is_default_network: argv["is-default-network"],
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
