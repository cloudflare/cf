import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/containers.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 containers registries create\n\nRegisters credentials for a supported private external image registry so Containers can pull images from it. This endpoint does not create a registry or upload an image. Public Docker Hub images and images in the Cloudflare managed registry do not require this configuration. Refer to [Image management](https://developers.cloudflare.com/containers/platform-details/image-management/) for supported registries and instructions for storing registry credentials."
		)
		.option("auth-private-credential-secret-name", {
			type: "string",
			description: "Name of the secret within the store.",
		})
		.option("auth-private-credential-store-id", {
			type: "string",
			description: "Identifier of the Secrets Store containing the secret.",
		})
		.option("auth-public-credential", {
			type: "string",
			description:
				"The non-secret part of the registry credential: an AWS access key ID for ECR,\na username for Docker Hub, or a service account email for Google Artifact Registry.\n",
		})
		.option("domain", {
			type: "string",
			description:
				"Hostname of the private registry, without a scheme or image path. Supported\nhostnames are `docker.io`, AWS ECR hostnames, and Google Artifact Registry\n`*-docker.pkg.dev` hostnames.\n",
		})
		.option("is-public", {
			type: "boolean",
			description:
				"Omit this field or set it to `false`. Public Docker Hub images do not require\nregistry configuration and cannot be added with this endpoint.\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Configuration for connecting Containers to a supported private external image registry. See [Image management](https://developers.cloudflare.com/containers/platform-details/image-management/) for supported providers and credential setup instructions. ",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createImageRegistry">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Configure a private external image registry",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers registries create",
				classification: {
					safeFlags: ["is-public", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.containers.registries.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.containers.registries.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
