import operation from "../../../_operations/zero-trust/dex/tests/update.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust dex tests update",
			classification: {
				safeFlags: [
					"data-kind",
					"data-method",
					"enabled",
					"targeted",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["data-host"] === undefined) {
					argv["data-host"] = await promptForRequiredField(
						"data-host",
						"The desired endpoint to test."
					);
				}
				if (argv["data-kind"] === undefined) {
					argv["data-kind"] = await promptForRequiredEnumField(
						"data-kind",
						"The type of test.",
						["http", "traceroute"] as const
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["interval"] === undefined) {
					argv["interval"] = await promptForRequiredField(
						"interval",
						"How often the test will run."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the DEX test. Must be unique."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust dex tests update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/devices/dex_tests/${argv["dex-test-id"] == null ? "<dex-test-id>" : encodeURIComponent(String(argv["dex-test-id"]))}`,
					pathParams: { "dex-test-id": String(argv["dex-test-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									data: {
										host: resolveFileToken(
											argv["data-host"] as string | undefined,
											"data-host",
											"text"
										),
										kind: argv["data-kind"],
										method: argv["data-method"],
									},
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									enabled: argv["enabled"],
									interval: resolveFileToken(
										argv["interval"] as string | undefined,
										"interval",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									target_policies: parseObjectArray(
										argv["target-policies"],
										"target-policies"
									),
									targeted: argv["targeted"],
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
						dex_test_id: argv["dex-test-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				data: {
					host: resolveFileToken(
						argv["data-host"] as string | undefined,
						"data-host",
						"text"
					),
					kind: argv["data-kind"],
					method: argv["data-method"],
				},
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				enabled: argv["enabled"],
				interval: resolveFileToken(
					argv["interval"] as string | undefined,
					"interval",
					"text"
				),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				target_policies: parseObjectArray(
					argv["target-policies"],
					"target-policies"
				),
				targeted: argv["targeted"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					dex_test_id: argv["dex-test-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
