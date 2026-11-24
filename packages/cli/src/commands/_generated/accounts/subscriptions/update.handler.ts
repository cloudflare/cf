import operation from "../../_operations/accounts/subscriptions/update.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "accounts subscriptions update",
			classification: {
				safeFlags: [
					"frequency",
					"rate-plan-externally-managed",
					"rate-plan-is-contract",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf accounts subscriptions update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/subscriptions/${argv["subscription-identifier"] == null ? "<subscription-identifier>" : encodeURIComponent(String(argv["subscription-identifier"]))}`,
					pathParams: {
						"subscription-identifier": String(
							argv["subscription-identifier"] ?? ""
						),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									app: {
										install_id: resolveFileToken(
											argv["app-install-id"] as string | undefined,
											"app-install-id",
											"text"
										),
									},
									component_values: parseObjectArray(
										argv["component-values"],
										"component-values"
									),
									frequency: argv["frequency"],
									rate_plan: {
										currency: resolveFileToken(
											argv["rate-plan-currency"] as string | undefined,
											"rate-plan-currency",
											"text"
										),
										externally_managed: argv["rate-plan-externally-managed"],
										id: resolveFileToken(
											argv["rate-plan-id"] as string | undefined,
											"rate-plan-id",
											"text"
										),
										is_contract: argv["rate-plan-is-contract"],
										public_name: resolveFileToken(
											argv["rate-plan-public-name"] as string | undefined,
											"rate-plan-public-name",
											"text"
										),
										scope: resolveFileToken(
											argv["rate-plan-scope"] as string | undefined,
											"rate-plan-scope",
											"text"
										),
										sets: argv["rate-plan-sets"],
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
						subscription_identifier: argv["subscription-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				app: {
					install_id: resolveFileToken(
						argv["app-install-id"] as string | undefined,
						"app-install-id",
						"text"
					),
				},
				component_values: parseObjectArray(
					argv["component-values"],
					"component-values"
				),
				frequency: argv["frequency"],
				rate_plan: {
					currency: resolveFileToken(
						argv["rate-plan-currency"] as string | undefined,
						"rate-plan-currency",
						"text"
					),
					externally_managed: argv["rate-plan-externally-managed"],
					id: resolveFileToken(
						argv["rate-plan-id"] as string | undefined,
						"rate-plan-id",
						"text"
					),
					is_contract: argv["rate-plan-is-contract"],
					public_name: resolveFileToken(
						argv["rate-plan-public-name"] as string | undefined,
						"rate-plan-public-name",
						"text"
					),
					scope: resolveFileToken(
						argv["rate-plan-scope"] as string | undefined,
						"rate-plan-scope",
						"text"
					),
					sets: argv["rate-plan-sets"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					subscription_identifier: argv["subscription-identifier"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
