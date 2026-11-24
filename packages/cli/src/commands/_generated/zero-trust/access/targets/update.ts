import operation from "../../../_operations/zero-trust/access/targets/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <target-id>",
	describe: "Update target",
	usage:
		"$0 zero-trust access targets update <target-id>\n\nUpdates an existing infrastructure access target by its ID.",
	flags: {
		hostname: {
			kind: "parsed",
			brief:
				"A non-unique field that refers to a target. Case insensitive, maximum\nlength of 255 characters, supports the use of special characters dash\nand period, does not support spaces, and must start and end with an\nalphanumeric character.",
			optional: true,
			parse: String,
		},
		"ip-ipv4-ip-addr": {
			kind: "parsed",
			brief: "IP address of the target",
			optional: true,
			parse: String,
		},
		"ip-ipv4-virtual-network-id": {
			kind: "parsed",
			brief:
				"(optional) Private virtual network identifier for the target. If omitted, the default virtual network ID will be used.",
			optional: true,
			parse: String,
		},
		"ip-ipv6-ip-addr": {
			kind: "parsed",
			brief: "IP address of the target",
			optional: true,
			parse: String,
		},
		"ip-ipv6-virtual-network-id": {
			kind: "parsed",
			brief:
				"(optional) Private virtual network identifier for the target. If omitted, the default virtual network ID will be used.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Optional tags to associate with the target. Keys and values are\nuser-defined strings. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
		{ placeholder: "target-id", brief: "Target identifier", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access targets update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["hostname"] === undefined) {
						argv["hostname"] = await promptForRequiredField(
							"hostname",
							"A non-unique field that refers to a target. Case insensitive, maximum length of 255 characters, supports the use of special characters dash and period, does not support spaces, and must start and end with an alphanumeric character."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access targets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/infrastructure/targets/${argv["target-id"] == null ? "<target-id>" : encodeURIComponent(String(argv["target-id"]))}`,
						pathParams: { "target-id": String(argv["target-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											hostname: resolveFileToken(
												argv["hostname"] as string | undefined,
												"hostname",
												"text"
											),
											ip: {
												ipv4: {
													ip_addr: resolveFileToken(
														argv["ip-ipv4-ip-addr"] as string | undefined,
														"ip-ipv4-ip-addr",
														"text"
													),
													virtual_network_id: resolveFileToken(
														argv["ip-ipv4-virtual-network-id"] as
															| string
															| undefined,
														"ip-ipv4-virtual-network-id",
														"text"
													),
												},
												ipv6: {
													ip_addr: resolveFileToken(
														argv["ip-ipv6-ip-addr"] as string | undefined,
														"ip-ipv6-ip-addr",
														"text"
													),
													virtual_network_id: resolveFileToken(
														argv["ip-ipv6-virtual-network-id"] as
															| string
															| undefined,
														"ip-ipv6-virtual-network-id",
														"text"
													),
												},
											},
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
									),
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
							target_id: argv["target-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						hostname: resolveFileToken(
							argv["hostname"] as string | undefined,
							"hostname",
							"text"
						),
						ip: {
							ipv4: {
								ip_addr: resolveFileToken(
									argv["ip-ipv4-ip-addr"] as string | undefined,
									"ip-ipv4-ip-addr",
									"text"
								),
								virtual_network_id: resolveFileToken(
									argv["ip-ipv4-virtual-network-id"] as string | undefined,
									"ip-ipv4-virtual-network-id",
									"text"
								),
							},
							ipv6: {
								ip_addr: resolveFileToken(
									argv["ip-ipv6-ip-addr"] as string | undefined,
									"ip-ipv6-ip-addr",
									"text"
								),
								virtual_network_id: resolveFileToken(
									argv["ip-ipv6-virtual-network-id"] as string | undefined,
									"ip-ipv6-virtual-network-id",
									"text"
								),
							},
						},
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						target_id: argv["target-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
