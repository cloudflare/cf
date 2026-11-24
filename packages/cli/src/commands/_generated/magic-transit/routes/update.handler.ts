import operation from "../../_operations/magic-transit/routes/update.js";
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
			command: "magic-transit routes update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["nexthop"] === undefined) {
					argv["nexthop"] = await promptForRequiredField(
						"nexthop",
						"The next-hop IP Address for the static route."
					);
				}
				if (argv["prefix"] === undefined) {
					argv["prefix"] = await promptForRequiredField(
						"prefix",
						"IP Prefix in Classless Inter-Domain Routing format."
					);
				}
				if (argv["priority"] === undefined) {
					throw new Error(
						"--priority is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit routes update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/routes/${argv["route-id"] == null ? "<route-id>" : encodeURIComponent(String(argv["route-id"]))}`,
					pathParams: { "route-id": String(argv["route-id"] ?? "") },
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
									nexthop: resolveFileToken(
										argv["nexthop"] as string | undefined,
										"nexthop",
										"text"
									),
									prefix: resolveFileToken(
										argv["prefix"] as string | undefined,
										"prefix",
										"text"
									),
									priority: argv["priority"],
									scope: {
										colo_names: argv["scope-colo-names"],
										colo_regions: argv["scope-colo-regions"],
									},
									weight: argv["weight"],
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
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				nexthop: resolveFileToken(
					argv["nexthop"] as string | undefined,
					"nexthop",
					"text"
				),
				prefix: resolveFileToken(
					argv["prefix"] as string | undefined,
					"prefix",
					"text"
				),
				priority: argv["priority"],
				scope: {
					colo_names: argv["scope-colo-names"],
					colo_regions: argv["scope-colo-regions"],
				},
				weight: argv["weight"],
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
