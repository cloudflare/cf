import operation from "../../../_operations/dns/zone-transfers/peers/update.js";
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
			command: "dns zone-transfers peers update",
			classification: {
				safeFlags: ["ixfr-enable", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the peer."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
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
						peer_id: argv["peer-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
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
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					peer_id: argv["peer-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
