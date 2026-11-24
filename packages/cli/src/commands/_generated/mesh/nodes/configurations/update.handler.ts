import operation from "../../../_operations/mesh/nodes/configurations/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "mesh nodes configurations update",
			classification: {
				safeFlags: ["ha-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["ha-mode"] === undefined) {
					argv["ha-mode"] = await promptForRequiredEnumField(
						"ha-mode",
						"High-availability mode for the Mesh node. \`none\` means HA is enabled but no provider is configured yet (newly created nodes default to this). \`disabled\` means HA is explicitly turned off. \`aws\` uses AWS ENI move for failover. \`local\` uses virtual IPs (VIPs) on the local interface.",
						["none", "disabled", "aws", "local"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf mesh nodes configurations update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/configurations`,
					pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									config: {
										fnr_id: resolveFileToken(
											argv["mesh-config-fnr-id"] as string | undefined,
											"mesh-config-fnr-id",
											"text"
										),
										vips: parseObjectArray(
											argv["mesh-config-vips"],
											"mesh-config-vips"
										),
										vips_previous: parseObjectArray(
											argv["mesh-config-vips-previous"],
											"mesh-config-vips-previous"
										),
									},
									ha_mode: argv["ha-mode"],
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
						tunnel_id: argv["tunnel-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				config: {
					fnr_id: resolveFileToken(
						argv["mesh-config-fnr-id"] as string | undefined,
						"mesh-config-fnr-id",
						"text"
					),
					vips: parseObjectArray(argv["mesh-config-vips"], "mesh-config-vips"),
					vips_previous: parseObjectArray(
						argv["mesh-config-vips-previous"],
						"mesh-config-vips-previous"
					),
				},
				ha_mode: argv["ha-mode"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					tunnel_id: argv["tunnel-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
