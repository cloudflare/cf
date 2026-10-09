import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/network-interconnects.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network-interconnects cnis update <cni>\n\nUpdates the configuration of an existing Cloud Network Interconnect (CNI), including connection parameters and routing settings."
		)
		.positional("cni", {
			type: "string",
			description: "CNI ID to retrieve information about",
			demandOption: true,
		})
		.option("account", { type: "string", description: "Customer account tag" })
		.option("bgp-customer-asn", {
			type: "number",
			description: "ASN used on the customer end of the BGP session",
		})
		.option("bgp-extra-prefixes", {
			type: "string",
			array: true,
			description:
				"Extra set of static prefixes to advertise to the customer's end of the session",
		})
		.option("bgp-md5-key", {
			type: "string",
			description:
				"MD5 key to use for session authentication.\n\nNote that *this is not a security measure*. MD5 is not a valid security mechanism, and the\nkey is not treated as a secret value. This is *only* supported for preventing\nmisconfiguration, not for defending against malicious attacks.\n\nThe MD5 key, if set, must be of non-zero length and consist only of the following types of\ncharacter:\n\n* ASCII alphanumerics: `[a-zA-Z0-9]`\n* Special characters in the set `'!@#$%^&*()+[]{}<>/.,;:_-~`= \\|`\n\nIn other words, MD5 keys may contain any printable ASCII character aside from newline\n(0x0A), quotation mark (`\"`), vertical tab (0x0B), carriage return (0x0D), tab (0x09),\nform feed (0x0C), and the question mark (`?`). Requests specifying an MD5 key with one\nor more of these disallowed characters will be rejected.",
		})
		.option("bgp-mode", {
			type: "string",
			description:
				"The BGP mode for a CNI.\nOne of the following:\n* `dynamic_route_exchange`\n* `advertise_only`",
			choices: ["dynamic_route_exchange", "advertise_only"],
		})
		.coerce("bgp-mode", (value) => resolveFileToken(value, "bgp-mode", "text"))
		.option("cust-ip", {
			type: "string",
			description:
				"Customer end of the point-to-point link\n\nThis should always be inside the same prefix as `p2p_ip`.",
		})
		.option("id", { type: "string", description: "The id field" })
		.option("interconnect", {
			type: "string",
			description: "Interconnect identifier hosting this CNI",
		})
		.option("magic-conduit-name", {
			type: "string",
			description: "The magic.conduit_name field",
		})
		.option("magic-description", {
			type: "string",
			description: "The magic.description field",
		})
		.option("magic-mtu", { type: "number", description: "The magic.mtu field" })
		.option("p2p-ip", {
			type: "string",
			description: "Cloudflare end of the point-to-point link",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"bgp-customer-asn",
				"bgp-extra-prefixes",
				"bgp-md5-key",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["bgp-customer-asn", "bgp-extra-prefixes"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --bgp-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"update_cni">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <cni>",
	describe: "Modify stored information about a CNI object",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects cnis update",
				classification: {
					safeFlags: ["bgp-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects cnis update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/cnis/${argv["cni"] == null ? "<cni>" : encodeURIComponent(String(argv["cni"]))}`,
						pathParams: { cni: String(argv["cni"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										account: resolveFileToken(
											argv["account"] as string | undefined,
											"account",
											"text"
										),
										bgp: {
											customer_asn: argv["bgp-customer-asn"],
											extra_prefixes: argv["bgp-extra-prefixes"],
											md5_key: resolveFileToken(
												argv["bgp-md5-key"] as string | undefined,
												"bgp-md5-key",
												"text"
											),
										},
										bgp_mode: argv["bgp-mode"],
										cust_ip: resolveFileToken(
											argv["cust-ip"] as string | undefined,
											"cust-ip",
											"text"
										),
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										interconnect: resolveFileToken(
											argv["interconnect"] as string | undefined,
											"interconnect",
											"text"
										),
										magic: {
											conduit_name: resolveFileToken(
												argv["magic-conduit-name"] as string | undefined,
												"magic-conduit-name",
												"text"
											),
											description: resolveFileToken(
												argv["magic-description"] as string | undefined,
												"magic-description",
												"text"
											),
											mtu: argv["magic-mtu"],
										},
										p2p_ip: resolveFileToken(
											argv["p2p-ip"] as string | undefined,
											"p2p-ip",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.networkInterconnects.cnis.update({
							body: bodyData,
							account_id: accountId,
							cni: argv["cni"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["account"] === undefined) {
					argv["account"] = await promptForRequiredField(
						"account",
						"Customer account tag"
					);
				}
				if (argv["cust-ip"] === undefined) {
					argv["cust-ip"] = await promptForRequiredField(
						"cust-ip",
						"Customer end of the point-to-point link  This should always be inside the same prefix as \`p2p_ip\`."
					);
				}
				if (argv["id"] === undefined) {
					argv["id"] = await promptForRequiredField("id", "The id field");
				}
				if (argv["interconnect"] === undefined) {
					argv["interconnect"] = await promptForRequiredField(
						"interconnect",
						"Interconnect identifier hosting this CNI"
					);
				}
				if (argv["magic-conduit-name"] === undefined) {
					argv["magic-conduit-name"] = await promptForRequiredField(
						"magic-conduit-name",
						"The magic.conduit_name field"
					);
				}
				if (argv["magic-description"] === undefined) {
					argv["magic-description"] = await promptForRequiredField(
						"magic-description",
						"The magic.description field"
					);
				}
				if (argv["magic-mtu"] === undefined) {
					throw new Error(
						"--magic-mtu is required (or pass --body with this field set)."
					);
				}
				if (argv["p2p-ip"] === undefined) {
					argv["p2p-ip"] = await promptForRequiredField(
						"p2p-ip",
						"Cloudflare end of the point-to-point link"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					account: resolveFileToken(
						argv["account"] as string | undefined,
						"account",
						"text"
					),
					bgp: {
						customer_asn: argv["bgp-customer-asn"],
						extra_prefixes: argv["bgp-extra-prefixes"],
						md5_key: resolveFileToken(
							argv["bgp-md5-key"] as string | undefined,
							"bgp-md5-key",
							"text"
						),
					},
					bgp_mode: argv["bgp-mode"],
					cust_ip: resolveFileToken(
						argv["cust-ip"] as string | undefined,
						"cust-ip",
						"text"
					),
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					interconnect: resolveFileToken(
						argv["interconnect"] as string | undefined,
						"interconnect",
						"text"
					),
					magic: {
						conduit_name: resolveFileToken(
							argv["magic-conduit-name"] as string | undefined,
							"magic-conduit-name",
							"text"
						),
						description: resolveFileToken(
							argv["magic-description"] as string | undefined,
							"magic-description",
							"text"
						),
						mtu: argv["magic-mtu"],
					},
					p2p_ip: resolveFileToken(
						argv["p2p-ip"] as string | undefined,
						"p2p-ip",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.networkInterconnects.cnis.update({
						body: bodyData,
						account_id: accountId,
						cni: argv["cni"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
