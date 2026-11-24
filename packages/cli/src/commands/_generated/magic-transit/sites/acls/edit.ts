import operation from "../../../_operations/magic-transit/sites/acls/edit.js";
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
	command: "edit <acl-id>",
	describe: "Patch Site ACL",
	usage:
		"$0 magic-transit sites acls edit <acl-id>\n\nPatch a specific Site ACL.",
	flags: {
		"site-id": { kind: "parsed", brief: "Identifier", parse: String },
		description: {
			kind: "parsed",
			brief: "Description for the ACL.",
			optional: true,
			parse: String,
		},
		"forward-locally": {
			kind: "boolean",
			brief:
				'The desired forwarding action for this ACL policy. If set to "false", the policy will forward traffic to Cloudflare. If set to "true", the policy will forward traffic locally on the Magic Connector. If not included in request, will default to false.',
			optional: true,
		},
		"lan-1-lan-id": {
			kind: "parsed",
			brief:
				"The identifier for the LAN you want to create an ACL policy with.",
			optional: true,
			parse: String,
		},
		"lan-1-lan-name": {
			kind: "parsed",
			brief: "The name of the LAN based on the provided lan_id.",
			optional: true,
			parse: String,
		},
		"lan-1-port-ranges": {
			kind: "parsed",
			brief:
				"Array of port ranges on the provided LAN that will be included in the ACL. If no ports or port rangess are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lan-1-ports": {
			kind: "parsed",
			brief:
				"Array of ports on the provided LAN that will be included in the ACL. If no ports or port ranges are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lan-2-lan-id": {
			kind: "parsed",
			brief:
				"The identifier for the LAN you want to create an ACL policy with.",
			optional: true,
			parse: String,
		},
		"lan-2-lan-name": {
			kind: "parsed",
			brief: "The name of the LAN based on the provided lan_id.",
			optional: true,
			parse: String,
		},
		"lan-2-port-ranges": {
			kind: "parsed",
			brief:
				"Array of port ranges on the provided LAN that will be included in the ACL. If no ports or port rangess are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lan-2-ports": {
			kind: "parsed",
			brief:
				"Array of ports on the provided LAN that will be included in the ACL. If no ports or port ranges are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the ACL.",
			optional: true,
			parse: String,
		},
		protocols: {
			kind: "parsed",
			brief: "The protocols field",
			variadic: true,
			optional: true,
			parse: String,
		},
		unidirectional: {
			kind: "boolean",
			brief:
				'The desired traffic direction for this ACL policy. If set to "false", the policy will allow bidirectional traffic. If set to "true", the policy will only allow traffic in one direction. If not included in request, will default to false.',
			optional: true,
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
	operands: [{ placeholder: "acl-id", brief: "Identifier", parse: String }],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"lan-1-lan-id",
				"lan-1-lan-name",
				"lan-1-port-ranges",
				"lan-1-ports",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["lan-1-lan-id"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --lan-1-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"lan-2-lan-id",
				"lan-2-lan-name",
				"lan-2-port-ranges",
				"lan-2-ports",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["lan-2-lan-id"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --lan-2-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites acls edit",
				classification: {
					safeFlags: ["forward-locally", "unidirectional", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites acls edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/acls/${argv["acl-id"] == null ? "<acl-id>" : encodeURIComponent(String(argv["acl-id"]))}`,
						pathParams: {
							"site-id": String(argv["site-id"] ?? ""),
							"acl-id": String(argv["acl-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										forward_locally: argv["forward-locally"],
										lan_1: {
											lan_id: resolveFileToken(
												argv["lan-1-lan-id"] as string | undefined,
												"lan-1-lan-id",
												"text"
											),
											lan_name: resolveFileToken(
												argv["lan-1-lan-name"] as string | undefined,
												"lan-1-lan-name",
												"text"
											),
											port_ranges: argv["lan-1-port-ranges"],
											ports: argv["lan-1-ports"],
										},
										lan_2: {
											lan_id: resolveFileToken(
												argv["lan-2-lan-id"] as string | undefined,
												"lan-2-lan-id",
												"text"
											),
											lan_name: resolveFileToken(
												argv["lan-2-lan-name"] as string | undefined,
												"lan-2-lan-name",
												"text"
											),
											port_ranges: argv["lan-2-port-ranges"],
											ports: argv["lan-2-ports"],
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										protocols: argv["protocols"],
										unidirectional: argv["unidirectional"],
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
							acl_id: argv["acl-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					forward_locally: argv["forward-locally"],
					lan_1: {
						lan_id: resolveFileToken(
							argv["lan-1-lan-id"] as string | undefined,
							"lan-1-lan-id",
							"text"
						),
						lan_name: resolveFileToken(
							argv["lan-1-lan-name"] as string | undefined,
							"lan-1-lan-name",
							"text"
						),
						port_ranges: argv["lan-1-port-ranges"],
						ports: argv["lan-1-ports"],
					},
					lan_2: {
						lan_id: resolveFileToken(
							argv["lan-2-lan-id"] as string | undefined,
							"lan-2-lan-id",
							"text"
						),
						lan_name: resolveFileToken(
							argv["lan-2-lan-name"] as string | undefined,
							"lan-2-lan-name",
							"text"
						),
						port_ranges: argv["lan-2-port-ranges"],
						ports: argv["lan-2-ports"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					protocols: argv["protocols"],
					unidirectional: argv["unidirectional"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
						acl_id: argv["acl-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
