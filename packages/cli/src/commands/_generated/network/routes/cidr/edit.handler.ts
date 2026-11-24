import operation from "../../../_operations/network/routes/cidr/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
