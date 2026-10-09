import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/custom-certificates.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 custom-certificates create\n\nUpload a new SSL certificate for a zone."
		)
		.option("bundle-method", {
			type: "string",
			description:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			choices: ["ubiquitous", "optimal", "force"],
			default: "ubiquitous",
		})
		.coerce("bundle-method", (value: string | undefined) =>
			resolveFileToken(value, "bundle-method", "text")
		)
		.option("certificate", {
			type: "string",
			description:
				"The zone's SSL certificate or certificate and the intermediate(s).",
		})
		.option("custom-csr-id", {
			type: "string",
			description: "The identifier for the Custom CSR that was used.",
		})
		.option("deploy", {
			type: "string",
			description:
				"The environment to deploy the certificate to, defaults to production.",
			choices: ["staging", "production"],
			default: "production",
		})
		.coerce("deploy", (value: string | undefined) =>
			resolveFileToken(value, "deploy", "text")
		)
		.option("geo-restrictions-label", {
			type: "string",
			description: "The geo_restrictions.label field",
			choices: ["us", "eu", "highest_security"],
		})
		.coerce("geo-restrictions-label", (value: string | undefined) =>
			resolveFileToken(value, "geo-restrictions-label", "text")
		)
		.option("policy", {
			type: "string",
			description:
				'Specify the policy that determines the region where your private key will be held locally. HTTPS connections to any excluded data center will still be fully encrypted, but will incur some latency while Keyless SSL is used to complete the handshake with the nearest allowed data center. Any combination of countries, specified by their two letter country code (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) can be chosen, such as \'country: IN\', as well as \'region: EU\' which refers to the EU region. If there are too few data centers satisfying the policy, it will be rejected.\nNote: The API accepts this field as either "policy" or "policy_restrictions" in requests. Responses return this field as "policy_restrictions".',
		})
		.option("private-key", {
			type: "string",
			description:
				"The zone's private key. Not required if custom_csr_id is provided, in which case the private key is retrieved from the CSR record held by Cloudflare.",
		})
		.option("type", {
			type: "string",
			description:
				"The type 'legacy_custom' enables support for legacy clients which do not include SNI in the TLS handshake.",
			choices: ["legacy_custom", "sni_custom"],
			default: "legacy_custom",
		})
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"custom-ssl-for-a-zone-create-ssl-configuration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create SSL Configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-certificates create",
				classification: {
					safeFlags: [
						"bundle-method",
						"deploy",
						"geo-restrictions-label",
						"type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-certificates create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_certificates`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bundle_method: argv["bundle-method"],
										certificate: resolveFileToken(
											argv["certificate"] as string | undefined,
											"certificate",
											"text"
										),
										custom_csr_id: resolveFileToken(
											argv["custom-csr-id"] as string | undefined,
											"custom-csr-id",
											"text"
										),
										deploy: argv["deploy"],
										geo_restrictions: {
											label: argv["geo-restrictions-label"],
										},
										policy: resolveFileToken(
											argv["policy"] as string | undefined,
											"policy",
											"text"
										),
										private_key: resolveFileToken(
											argv["private-key"] as string | undefined,
											"private-key",
											"text"
										),
										type: argv["type"],
									}),
						sensitiveBodyPaths: [["private_key"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.customCertificates.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["certificate"] === undefined) {
					argv["certificate"] = await promptForRequiredField(
						"certificate",
						"The zone's SSL certificate or certificate and the intermediate(s)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					bundle_method: argv["bundle-method"],
					certificate: resolveFileToken(
						argv["certificate"] as string | undefined,
						"certificate",
						"text"
					),
					custom_csr_id: resolveFileToken(
						argv["custom-csr-id"] as string | undefined,
						"custom-csr-id",
						"text"
					),
					deploy: argv["deploy"],
					geo_restrictions: {
						label: argv["geo-restrictions-label"],
					},
					policy: resolveFileToken(
						argv["policy"] as string | undefined,
						"policy",
						"text"
					),
					private_key: resolveFileToken(
						argv["private-key"] as string | undefined,
						"private-key",
						"text"
					),
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.customCertificates.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
