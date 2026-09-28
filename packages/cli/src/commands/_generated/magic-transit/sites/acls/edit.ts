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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit sites acls edit <acl-id>\n\nPatch a specific Site ACL."
		)
		.positional("acl-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "Description for the ACL.",
		})
		.option("forward-locally", {
			type: "boolean",
			description:
				'The desired forwarding action for this ACL policy. If set to "false", the policy will forward traffic to Cloudflare. If set to "true", the policy will forward traffic locally on the Magic Connector. If not included in request, will default to false.',
		})
		.option("lan-1-lan-id", {
			type: "string",
			description:
				"The identifier for the LAN you want to create an ACL policy with.",
		})
		.option("lan-1-lan-name", {
			type: "string",
			description: "The name of the LAN based on the provided lan_id.",
		})
		.option("lan-1-port-ranges", {
			type: "string",
			array: true,
			description:
				"Array of port ranges on the provided LAN that will be included in the ACL. If no ports or port rangess are provided, communication on any port on this LAN is allowed.",
		})
		.option("lan-1-ports", {
			type: "string",
			array: true,
			description:
				"Array of ports on the provided LAN that will be included in the ACL. If no ports or port ranges are provided, communication on any port on this LAN is allowed.",
		})
		.option("lan-2-lan-id", {
			type: "string",
			description:
				"The identifier for the LAN you want to create an ACL policy with.",
		})
		.option("lan-2-lan-name", {
			type: "string",
			description: "The name of the LAN based on the provided lan_id.",
		})
		.option("lan-2-port-ranges", {
			type: "string",
			array: true,
			description:
				"Array of port ranges on the provided LAN that will be included in the ACL. If no ports or port rangess are provided, communication on any port on this LAN is allowed.",
		})
		.option("lan-2-ports", {
			type: "string",
			array: true,
			description:
				"Array of ports on the provided LAN that will be included in the ACL. If no ports or port ranges are provided, communication on any port on this LAN is allowed.",
		})
		.option("name", { type: "string", description: "The name of the ACL." })
		.option("protocols", {
			type: "string",
			array: true,
			description: "The protocols field",
		})
		.option("unidirectional", {
			type: "boolean",
			description:
				'The desired traffic direction for this ACL policy. If set to "false", the policy will allow bidirectional traffic. If set to "true", the policy will only allow traffic in one direction. If not included in request, will default to false.',
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
				"lan-1-lan-id",
				"lan-1-lan-name",
				"lan-1-port-ranges",
				"lan-1-ports",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["lan-1-lan-id"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --lan_1-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"lan-2-lan-id",
				"lan-2-lan-name",
				"lan-2-port-ranges",
				"lan-2-ports",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["lan-2-lan-id"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --lan_2-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"magic-site-acls-patch-acl">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <acl-id>",
	describe: "Patch Site ACL",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites acls edit",
				classification: {
					safeFlags: ["forward-locally", "unidirectional", "dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.sites.acls.edit({
							body: bodyData,
							account_id: accountId,
							site_id: argv["site-id"],
							acl_id: argv["acl-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.magicTransit.sites.acls.edit({
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
						acl_id: argv["acl-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
