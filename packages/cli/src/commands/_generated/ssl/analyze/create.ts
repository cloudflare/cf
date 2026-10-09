import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/ssl.ts
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
			"$0 ssl analyze create\n\nReturns the set of hostnames, the signature algorithm, and the expiration date of the certificate."
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

type Request = SdkRequest<"analyze-certificate-analyze-certificate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Analyze Certificate",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl analyze create",
				classification: {
					safeFlags: ["bundle-method", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl analyze create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/ssl/analyze`,
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
									}),
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
						client.ssl.analyze.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.ssl.analyze.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
