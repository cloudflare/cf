import operation from "../../../_operations/addressing/prefixes/bgp-prefixes/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "addressing prefixes bgp-prefixes edit",
			classification: {
				safeFlags: [
					"auto-advertise-withdraw",
					"on-demand-advertised",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
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
						prefix_id: argv["prefix-id"],
						bgp_prefix_id: argv["bgp-prefix-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				asn_prepend_count: argv["asn-prepend-count"],
				auto_advertise_withdraw: argv["auto-advertise-withdraw"],
				on_demand: {
					advertised: argv["on-demand-advertised"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					prefix_id: argv["prefix-id"],
					bgp_prefix_id: argv["bgp-prefix-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
