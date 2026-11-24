import operation from "../../_operations/containers/registries/create.js";
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
			command: "containers registries create",
			classification: {
				safeFlags: ["is-public", "kind", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["auth-private-credential-secret-name"] === undefined) {
					argv["auth-private-credential-secret-name"] =
						await promptForRequiredField(
							"auth-private-credential-secret-name",
							"Name of the secret within the store."
						);
				}
				if (argv["auth-private-credential-store-id"] === undefined) {
					argv["auth-private-credential-store-id"] =
						await promptForRequiredField(
							"auth-private-credential-store-id",
							"Identifier of the Secrets Store containing the secret."
						);
				}
				if (argv["auth-public-credential"] === undefined) {
					argv["auth-public-credential"] = await promptForRequiredField(
						"auth-public-credential",
						"The non-secret part of the registry credential: an AWS access key ID for ECR, a username for Docker Hub, or a service account email for Google Artifact Registry. "
					);
				}
				if (argv["domain"] === undefined) {
					argv["domain"] = await promptForRequiredField(
						"domain",
						"Hostname of the private registry, without a scheme or image path. Supported hostnames are \`docker.io\`, AWS ECR hostnames, and Google Artifact Registry \`*-docker.pkg.dev\` hostnames. "
					);
				}
				if (argv["kind"] === undefined) {
					argv["kind"] = await promptForRequiredEnumField(
						"kind",
						"Registry provider. This must match \`domain\`: \`DockerHub\` for \`docker.io\`, \`ECR\` for AWS ECR, or \`GAR\` for Google Artifact Registry. ",
						["ECR", "DockerHub", "GAR"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf containers registries create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/registries`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									auth: {
										private_credential: {
											secret_name: resolveFileToken(
												argv["auth-private-credential-secret-name"] as
													| string
													| undefined,
												"auth-private-credential-secret-name",
												"text"
											),
											store_id: resolveFileToken(
												argv["auth-private-credential-store-id"] as
													| string
													| undefined,
												"auth-private-credential-store-id",
												"text"
											),
										},
										public_credential: resolveFileToken(
											argv["auth-public-credential"] as string | undefined,
											"auth-public-credential",
											"text"
										),
									},
									domain: resolveFileToken(
										argv["domain"] as string | undefined,
										"domain",
										"text"
									),
									is_public: argv["is-public"],
									kind: argv["kind"],
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
				auth: {
					private_credential: {
						secret_name: resolveFileToken(
							argv["auth-private-credential-secret-name"] as string | undefined,
							"auth-private-credential-secret-name",
							"text"
						),
						store_id: resolveFileToken(
							argv["auth-private-credential-store-id"] as string | undefined,
							"auth-private-credential-store-id",
							"text"
						),
					},
					public_credential: resolveFileToken(
						argv["auth-public-credential"] as string | undefined,
						"auth-public-credential",
						"text"
					),
				},
				domain: resolveFileToken(
					argv["domain"] as string | undefined,
					"domain",
					"text"
				),
				is_public: argv["is-public"],
				kind: argv["kind"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
