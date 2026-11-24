import operation from "../../../_operations/zero-trust/devices/networks/create.js";
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
			command: "zero-trust devices networks create",
			classification: {
				safeFlags: ["type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["network-config-tls-sockaddr"] === undefined) {
					argv["network-config-tls-sockaddr"] = await promptForRequiredField(
						"network-config-tls-sockaddr",
						'A network address of the form "host:port" that the WARP client will use to detect the presence of a TLS host.'
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the device managed network. This name must be unique."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type of device managed network.",
						["tls"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust devices networks create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/networks`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									config: {
										sha256: resolveFileToken(
											argv["network-config-sha256"] as string | undefined,
											"network-config-sha256",
											"text"
										),
										tls_sockaddr: resolveFileToken(
											argv["network-config-tls-sockaddr"] as string | undefined,
											"network-config-tls-sockaddr",
											"text"
										),
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									type: argv["type"],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				config: {
					sha256: resolveFileToken(
						argv["network-config-sha256"] as string | undefined,
						"network-config-sha256",
						"text"
					),
					tls_sockaddr: resolveFileToken(
						argv["network-config-tls-sockaddr"] as string | undefined,
						"network-config-tls-sockaddr",
						"text"
					),
				},
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
