import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/custom-certificates.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 custom-certificates edit <custom-certificate-id>\n\nUpload a new private key and/or PEM/CRT for the SSL certificate. Note: PATCHing a configuration for sni_custom certificates will result in a new resource id being returned, and the previous one being deleted."
		)
		.positional("custom-certificate-id", {
			type: "string",
			description: "Custom certificate identifier tag.",
			demandOption: true,
		})
		.option("bundle-method", {
			type: "string",
			description:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			choices: ["ubiquitous", "optimal", "force"],
		})
		.coerce("bundle-method", (value) =>
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
		})
		.coerce("deploy", (value) => resolveFileToken(value, "deploy", "text"))
		.option("geo-restrictions-label", {
			type: "string",
			description: "The geo_restrictions.label field",
			choices: ["us", "eu", "highest_security"],
		})
		.coerce("geo-restrictions-label", (value) =>
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

type Request = SdkRequest<"custom-ssl-for-a-zone-edit-ssl-configuration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <custom-certificate-id>",
	describe: "Edit SSL Configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-certificates edit",
				classification: {
					safeFlags: [
						"bundle-method",
						"deploy",
						"geo-restrictions-label",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-certificates edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_certificates/${argv["custom-certificate-id"] == null ? "<custom-certificate-id>" : encodeURIComponent(String(argv["custom-certificate-id"]))}`,
						pathParams: {
							"custom-certificate-id": String(
								argv["custom-certificate-id"] ?? ""
							),
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
					const result = await withProgress(`Updating`, async () =>
						client.customCertificates.edit({
							...bodyData,
							zone_id: zoneId,
							custom_certificate_id: argv["custom-certificate-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.customCertificates.edit({
						...bodyData,
						zone_id: zoneId,
						custom_certificate_id: argv["custom-certificate-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
