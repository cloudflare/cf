import operation from "../../../_operations/flagship/apps/flags/update.js";
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
			command: "flagship apps flags update",
			classification: {
				safeFlags: ["enabled", "type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["default-variation"] === undefined) {
					argv["default-variation"] = await promptForRequiredField(
						"default-variation",
						"Variation the API serves when the flag is off, or when it's on but no rule matches the context. Must be a key in \`variations\`."
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["key"] === undefined) {
					argv["key"] = await promptForRequiredField(
						"key",
						"Unique identifier for the flag within an app. Used in all evaluation and SDK calls."
					);
				}
				if (argv["rules"] === undefined) {
					throw new Error(
						"--rules is required (or pass --body with this field set)."
					);
				}
				if (argv["variations"] === undefined) {
					throw new Error(
						"--variations is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf flagship apps flags update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/flags/${argv["flag-key"] == null ? "<flag-key>" : encodeURIComponent(String(argv["flag-key"]))}`,
					pathParams: {
						"app-id": String(argv["app-id"] ?? ""),
						"flag-key": String(argv["flag-key"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body, [
									{ path: ["variations"], flag: "variations" },
								])
							: compactBody(
									{
										default_variation: resolveFileToken(
											argv["default-variation"] as string | undefined,
											"default-variation",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										key: resolveFileToken(
											argv["key"] as string | undefined,
											"key",
											"text"
										),
										metadata: parseJsonMap(argv["metadata"], "metadata"),
										rules: parseObjectArray(argv["rules"], "rules"),
										type: argv["type"],
										variations: parseJsonMap(
											argv["variations"],
											"variations",
											true
										),
									},
									[["metadata"], ["variations"]]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? parseBody(argv.body, [{ path: ["variations"], flag: "variations" }])
					: undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						flag_key: argv["flag-key"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					default_variation: resolveFileToken(
						argv["default-variation"] as string | undefined,
						"default-variation",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					key: resolveFileToken(
						argv["key"] as string | undefined,
						"key",
						"text"
					),
					metadata: parseJsonMap(argv["metadata"], "metadata"),
					rules: parseObjectArray(argv["rules"], "rules"),
					type: argv["type"],
					variations: parseJsonMap(argv["variations"], "variations", true),
				},
				[["metadata"], ["variations"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					app_id: argv["app-id"],
					flag_key: argv["flag-key"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
