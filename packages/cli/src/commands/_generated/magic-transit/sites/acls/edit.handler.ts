import operation from "../../../_operations/magic-transit/sites/acls/edit.js";
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
			command: "magic-transit sites acls edit",
			classification: {
				safeFlags: ["forward-locally", "unidirectional", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
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
						site_id: argv["site-id"],
						acl_id: argv["acl-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
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
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					site_id: argv["site-id"],
					acl_id: argv["acl-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
