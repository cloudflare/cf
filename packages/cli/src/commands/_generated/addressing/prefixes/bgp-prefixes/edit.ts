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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/addressing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 addressing prefixes bgp-prefixes edit <bgp-prefix-id>\n\nUpdate the properties of a BGP Prefix, such as the on demand advertisement status (advertised or withdrawn)."
		)
		.positional("bgp-prefix-id", {
			type: "string",
			description: "Identifier of BGP Prefix.",
			demandOption: true,
		})
		.option("prefix-id", {
			type: "string",
			description: "Identifier of an IP Prefix.",
			demandOption: true,
		})
		.option("asn-prepend-count", {
			type: "number",
			description:
				"Number of times to prepend the Cloudflare ASN to the BGP AS-Path attribute",
		})
		.option("auto-advertise-withdraw", {
			type: "boolean",
			description:
				"Determines if Cloudflare advertises a BYOIP BGP prefix even when there is no matching BGP prefix in the Magic routing table. When true, Cloudflare will automatically withdraw the BGP prefix when there are no matching BGP routes, and will resume advertising when there is at least one matching BGP route.",
		})
		.option("on-demand-advertised", {
			type: "boolean",
			description: "The on_demand.advertised field",
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

type Request = SdkRequest<"ip-address-management-prefixes-update-bgp-prefix">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <bgp-prefix-id>",
	describe: "Update BGP Prefix",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing prefixes bgp-prefixes edit",
				classification: {
					safeFlags: [
						"auto-advertise-withdraw",
						"on-demand-advertised",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing prefixes bgp-prefixes edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/prefixes/${argv["prefix-id"] == null ? "<prefix-id>" : encodeURIComponent(String(argv["prefix-id"]))}/bgp/prefixes/${argv["bgp-prefix-id"] == null ? "<bgp-prefix-id>" : encodeURIComponent(String(argv["bgp-prefix-id"]))}`,
						pathParams: {
							"prefix-id": String(argv["prefix-id"] ?? ""),
							"bgp-prefix-id": String(argv["bgp-prefix-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										asn_prepend_count: argv["asn-prepend-count"],
										auto_advertise_withdraw: argv["auto-advertise-withdraw"],
										on_demand: {
											advertised: argv["on-demand-advertised"],
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.addressing.prefixes.bgpPrefixes.edit({
							...bodyData,
							account_id: accountId,
							prefix_id: argv["prefix-id"],
							bgp_prefix_id: argv["bgp-prefix-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					asn_prepend_count: argv["asn-prepend-count"],
					auto_advertise_withdraw: argv["auto-advertise-withdraw"],
					on_demand: {
						advertised: argv["on-demand-advertised"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.addressing.prefixes.bgpPrefixes.edit({
						...bodyData,
						account_id: accountId,
						prefix_id: argv["prefix-id"],
						bgp_prefix_id: argv["bgp-prefix-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
