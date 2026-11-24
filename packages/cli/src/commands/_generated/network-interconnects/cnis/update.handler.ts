import operation from "../../_operations/network-interconnects/cnis/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "network-interconnects cnis update",
			classification: {
				safeFlags: ["bgp-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
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
						cni: argv["cni"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
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
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					cni: argv["cni"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
