import operation from "../../../../_operations/cloudforce-one/rules/email/approvals/replace.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./replace.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one rules email approvals replace",
			classification: {
				safeFlags: [
					"module",
					"condition-operator",
					"condition-type",
					"enabled",
					"status",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				module: argv["module"],
			};
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["condition-conditions"] === undefined) {
					throw new Error(
						"--condition-conditions is required (or pass --body with this field set)."
					);
				}
				if (argv["condition-operator"] === undefined) {
					argv["condition-operator"] = await promptForRequiredEnumField(
						"condition-operator",
						"The condition.operator field",
						["and", "or"] as const
					);
				}
				if (argv["condition-type"] === undefined) {
					argv["condition-type"] = await promptForRequiredEnumField(
						"condition-type",
						"The condition.type field",
						["group"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one rules email approvals replace",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/structured/approvals/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
					pathParams: { id: String(argv["id"] ?? "") },
					query: queryParams,
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									condition: {
										conditions: parseObjectArray(
											argv["condition-conditions"],
											"condition-conditions"
										),
										operator: argv["condition-operator"],
										type: argv["condition-type"],
									},
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									enabled: argv["enabled"],
									meta: parseObjectArray(argv["meta"], "meta"),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									status: argv["status"],
									strings: parseObjectArray(argv["strings"], "strings"),
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
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				condition: {
					conditions: parseObjectArray(
						argv["condition-conditions"],
						"condition-conditions"
					),
					operator: argv["condition-operator"],
					type: argv["condition-type"],
				},
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				enabled: argv["enabled"],
				meta: parseObjectArray(argv["meta"], "meta"),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				status: argv["status"],
				strings: parseObjectArray(argv["strings"], "strings"),
			});
			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					id: argv["id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
