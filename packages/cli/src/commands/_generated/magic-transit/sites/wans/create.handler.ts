import operation from "../../../_operations/magic-transit/sites/wans/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "magic-transit sites wans create",
			classification: {
				safeFlags: ["health-check-rate", "load-balance-inner-flows", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["physport"] === undefined) {
					throw new Error(
						"--physport is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit sites wans create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/wans`,
					pathParams: { "site-id": String(argv["site-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									health_check_rate: argv["health-check-rate"],
									load_balance_inner_flows: argv["load-balance-inner-flows"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									physport: argv["physport"],
									priority: argv["priority"],
									provisioned_download_kbps: argv["provisioned-download-kbps"],
									provisioned_upload_kbps: argv["provisioned-upload-kbps"],
									static_addressing: {
										address: resolveFileToken(
											argv["static-addressing-address"] as string | undefined,
											"static-addressing-address",
											"text"
										),
										gateway_address: resolveFileToken(
											argv["static-addressing-gateway-address"] as
												| string
												| undefined,
											"static-addressing-gateway-address",
											"text"
										),
										secondary_address: resolveFileToken(
											argv["static-addressing-secondary-address"] as
												| string
												| undefined,
											"static-addressing-secondary-address",
											"text"
										),
										secondary_gateway_address: resolveFileToken(
											argv["static-addressing-secondary-gateway-address"] as
												| string
												| undefined,
											"static-addressing-secondary-gateway-address",
											"text"
										),
									},
									vlan_tag: argv["vlan-tag"],
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				health_check_rate: argv["health-check-rate"],
				load_balance_inner_flows: argv["load-balance-inner-flows"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				physport: argv["physport"],
				priority: argv["priority"],
				provisioned_download_kbps: argv["provisioned-download-kbps"],
				provisioned_upload_kbps: argv["provisioned-upload-kbps"],
				static_addressing: {
					address: resolveFileToken(
						argv["static-addressing-address"] as string | undefined,
						"static-addressing-address",
						"text"
					),
					gateway_address: resolveFileToken(
						argv["static-addressing-gateway-address"] as string | undefined,
						"static-addressing-gateway-address",
						"text"
					),
					secondary_address: resolveFileToken(
						argv["static-addressing-secondary-address"] as string | undefined,
						"static-addressing-secondary-address",
						"text"
					),
					secondary_gateway_address: resolveFileToken(
						argv["static-addressing-secondary-gateway-address"] as
							| string
							| undefined,
						"static-addressing-secondary-gateway-address",
						"text"
					),
				},
				vlan_tag: argv["vlan-tag"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					site_id: argv["site-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
