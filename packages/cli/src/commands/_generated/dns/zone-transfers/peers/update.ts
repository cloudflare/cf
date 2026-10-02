import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/dns.ts
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
		.usage("$0 dns zone-transfers peers update <peer-id>\n\nModify Peer.")
		.positional("peer-id", {
			type: "string",
			description: "Peer ID",
			demandOption: true,
		})
		.option("ip", {
			type: "string",
			description:
				"IPv4/IPv6 address of primary or secondary nameserver, depending on what zone this peer is linked to. For primary zones this IP defines the IP of the secondary nameserver Cloudflare will NOTIFY upon zone changes. For secondary zones this IP defines the IP of the primary nameserver Cloudflare will send AXFR/IXFR requests to.",
		})
		.option("ixfr-enable", {
			type: "boolean",
			description:
				"Enable IXFR transfer protocol, default is AXFR. Only applicable to secondary zones.",
		})
		.option("name", { type: "string", description: "The name of the peer." })
		.option("port", {
			type: "number",
			description:
				"DNS port of primary or secondary nameserver, depending on what zone this peer is linked to.",
		})
		.option("tsig-id", {
			type: "string",
			description:
				"TSIG authentication will be used for zone transfer if configured.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"secondary-dns-(-peer)-update-peer">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <peer-id>",
	describe: "Update Peer",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns zone-transfers peers update",
				classification: {
					safeFlags: ["ixfr-enable", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns zone-transfers peers update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secondary_dns/peers/${argv["peer-id"] == null ? "<peer-id>" : encodeURIComponent(String(argv["peer-id"]))}`,
						pathParams: { "peer-id": String(argv["peer-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ip: resolveFileToken(
											argv["ip"] as string | undefined,
											"ip",
											"text"
										),
										ixfr_enable: argv["ixfr-enable"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										port: argv["port"],
										tsig_id: resolveFileToken(
											argv["tsig-id"] as string | undefined,
											"tsig-id",
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
						client.dns.zoneTransfers.peers.update({
							body: bodyData,
							account_id: accountId,
							peer_id: argv["peer-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the peer."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ip: resolveFileToken(argv["ip"] as string | undefined, "ip", "text"),
					ixfr_enable: argv["ixfr-enable"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					port: argv["port"],
					tsig_id: resolveFileToken(
						argv["tsig-id"] as string | undefined,
						"tsig-id",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.dns.zoneTransfers.peers.update({
						body: bodyData,
						account_id: accountId,
						peer_id: argv["peer-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
