import operation from "../../_operations/containers/applications/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "containers applications edit",
			classification: {
				safeFlags: [
					"configuration-wrangler-ssh-enabled",
					"observability-logs-enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf containers applications edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/applications/${argv["application-id"] == null ? "<application-id>" : encodeURIComponent(String(argv["application-id"]))}`,
					pathParams: {
						"application-id": String(argv["application-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									configuration: {
										authorized_keys: parseObjectArray(
											argv["configuration-authorized-keys"],
											"configuration-authorized-keys"
										),
										wrangler_ssh: {
											enabled: argv["configuration-wrangler-ssh-enabled"],
											port: argv["configuration-wrangler-ssh-port"],
										},
									},
									constraints: {
										jurisdiction: resolveFileToken(
											argv["constraints-jurisdiction"] as string | undefined,
											"constraints-jurisdiction",
											"text"
										),
										regions: argv["constraints-regions"],
									},
									max_instances: argv["max-instances"],
									observability: {
										logs: {
											enabled: argv["observability-logs-enabled"],
										},
									},
									rollout_active_grace_period:
										argv["rollout-active-grace-period"],
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
						application_id: argv["application-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				configuration: {
					authorized_keys: parseObjectArray(
						argv["configuration-authorized-keys"],
						"configuration-authorized-keys"
					),
					wrangler_ssh: {
						enabled: argv["configuration-wrangler-ssh-enabled"],
						port: argv["configuration-wrangler-ssh-port"],
					},
				},
				constraints: {
					jurisdiction: resolveFileToken(
						argv["constraints-jurisdiction"] as string | undefined,
						"constraints-jurisdiction",
						"text"
					),
					regions: argv["constraints-regions"],
				},
				max_instances: argv["max-instances"],
				observability: {
					logs: {
						enabled: argv["observability-logs-enabled"],
					},
				},
				rollout_active_grace_period: argv["rollout-active-grace-period"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					application_id: argv["application-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
