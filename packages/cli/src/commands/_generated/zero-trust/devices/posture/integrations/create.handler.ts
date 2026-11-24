import operation from "../../../../_operations/zero-trust/devices/posture/integrations/create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust devices posture integrations create",
			classification: {
				safeFlags: ["type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["interval"] === undefined) {
					argv["interval"] = await promptForRequiredField(
						"interval",
						"The interval between each posture check with the third-party API. Use \`m\` for minutes (e.g. \`5m\`) and \`h\` for hours (e.g. \`12h\`)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the device posture integration."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type of device posture integration.",
						[
							"workspace_one",
							"crowdstrike_s2s",
							"uptycs",
							"intune",
							"kolide",
							"tanium_s2s",
							"sentinelone_s2s",
							"custom_s2s",
						] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust devices posture integrations create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/posture/integration`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									config: {
										api_url: resolveFileToken(
											argv["integration-config-api-url"] as string | undefined,
											"integration-config-api-url",
											"text"
										),
										auth_url: resolveFileToken(
											argv["integration-config-auth-url"] as string | undefined,
											"integration-config-auth-url",
											"text"
										),
										client_id: resolveFileToken(
											argv["integration-config-client-id"] as
												| string
												| undefined,
											"integration-config-client-id",
											"text"
										),
										client_secret: resolveFileToken(
											argv["integration-config-client-secret"] as
												| string
												| undefined,
											"integration-config-client-secret",
											"text"
										),
										customer_id: resolveFileToken(
											argv["integration-config-customer-id"] as
												| string
												| undefined,
											"integration-config-customer-id",
											"text"
										),
										client_key: resolveFileToken(
											argv["integration-config-client-key"] as
												| string
												| undefined,
											"integration-config-client-key",
											"text"
										),
										access_client_id: resolveFileToken(
											argv["integration-config-access-client-id"] as
												| string
												| undefined,
											"integration-config-access-client-id",
											"text"
										),
										access_client_secret: resolveFileToken(
											argv["integration-config-access-client-secret"] as
												| string
												| undefined,
											"integration-config-access-client-secret",
											"text"
										),
									},
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
									type: argv["type"],
								}),
					sensitiveBodyPaths: [
						["config", "client_secret"],
						["config", "client_key"],
						["config", "access_client_secret"],
					],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				config: {
					api_url: resolveFileToken(
						argv["integration-config-api-url"] as string | undefined,
						"integration-config-api-url",
						"text"
					),
					auth_url: resolveFileToken(
						argv["integration-config-auth-url"] as string | undefined,
						"integration-config-auth-url",
						"text"
					),
					client_id: resolveFileToken(
						argv["integration-config-client-id"] as string | undefined,
						"integration-config-client-id",
						"text"
					),
					client_secret: resolveFileToken(
						argv["integration-config-client-secret"] as string | undefined,
						"integration-config-client-secret",
						"text"
					),
					customer_id: resolveFileToken(
						argv["integration-config-customer-id"] as string | undefined,
						"integration-config-customer-id",
						"text"
					),
					client_key: resolveFileToken(
						argv["integration-config-client-key"] as string | undefined,
						"integration-config-client-key",
						"text"
					),
					access_client_id: resolveFileToken(
						argv["integration-config-access-client-id"] as string | undefined,
						"integration-config-access-client-id",
						"text"
					),
					access_client_secret: resolveFileToken(
						argv["integration-config-access-client-secret"] as
							| string
							| undefined,
						"integration-config-access-client-secret",
						"text"
					),
				},
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
				type: argv["type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
