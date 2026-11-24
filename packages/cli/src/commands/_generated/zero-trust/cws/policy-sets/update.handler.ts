import operation from "../../../_operations/zero-trust/cws/policy-sets/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
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
			command: "zero-trust cws policy-sets update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the policy set"
					);
				}
				if (argv["policies"] === undefined) {
					throw new Error(
						"--policies is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust cws policy-sets update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/policy-sets/${argv["policy-set-id"] == null ? "<policy-set-id>" : encodeURIComponent(String(argv["policy-set-id"]))}`,
					pathParams: { "policy-set-id": String(argv["policy-set-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										exclude_workload_ids: argv["exclude-workload-ids"],
										include_workload_ids: argv["include-workload-ids"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										policies: parseObjectArray(
											argv["policies"],
											"policies",
											true
										),
										tags: parseJsonMap(argv["tags"], "tags"),
									},
									[["tags"]]
								),
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
						policy_set_id: argv["policy-set-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					exclude_workload_ids: argv["exclude-workload-ids"],
					include_workload_ids: argv["include-workload-ids"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					policies: parseObjectArray(argv["policies"], "policies", true),
					tags: parseJsonMap(argv["tags"], "tags"),
				},
				[["tags"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					policy_set_id: argv["policy-set-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
