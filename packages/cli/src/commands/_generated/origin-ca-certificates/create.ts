import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/origin-ca-certificates.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 origin-ca-certificates create\n\nCreate an Origin CA certificate. You can use an Origin CA Key as your User Service Key or an API token when calling this endpoint ([see above](#requests))."
		)
		.option("csr", {
			type: "string",
			description:
				"The Certificate Signing Request (CSR). Must be newline-encoded.",
		})
		.option("hostnames", {
			type: "string",
			array: true,
			description:
				"Array of hostnames or wildcard names bound to the certificate.\nHostnames must be fully qualified domain names (FQDNs) belonging to zones on your account (e.g., `example.com` or `sub.example.com`). Wildcards are supported only as a `*.` prefix for a single level (e.g., `*.example.com`). Double wildcards (`*.*.example.com`) and interior wildcards (`foo.*.example.com`) are not allowed. The wildcard suffix must be a multi-label domain (`*.example.com` is valid, but `*.com` is not). Unicode/IDN hostnames are accepted and automatically converted to punycode.",
		})
		.option("request-type", {
			type: "string",
			description:
				'Signature type desired on certificate ("origin-rsa" (rsa), "origin-ecc" (ecdsa), or "keyless-certificate" (for Keyless SSL servers).',
			choices: ["origin-rsa", "origin-ecc", "keyless-certificate"],
		})
		.option("requested-validity", {
			type: "number",
			description:
				"The number of days for which the certificate should be valid.",
			default: 5475,
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

type Request = SdkRequest<"origin-ca-create-certificate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Certificate",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "origin-ca-certificates create",
				classification: {
					safeFlags: ["request-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf origin-ca-certificates create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/certificates`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										csr: resolveFileToken(
											argv["csr"] as string | undefined,
											"csr",
											"text"
										),
										hostnames: argv["hostnames"],
										request_type: resolveFileToken(
											argv["request-type"] as string | undefined,
											"request-type",
											"text"
										),
										requested_validity: argv["requested-validity"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.originCaCertificates.create({
							...bodyData,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["csr"] === undefined) {
					argv["csr"] = await promptForRequiredField(
						"csr",
						"The Certificate Signing Request (CSR). Must be newline-encoded."
					);
				}
				if (argv["hostnames"] === undefined) {
					throw new Error(
						"--hostnames is required (or pass --body with this field set)."
					);
				}
				if (argv["request-type"] === undefined) {
					argv["request-type"] = await promptForRequiredEnumField(
						"request-type",
						'Signature type desired on certificate ("origin-rsa" (rsa), "origin-ecc" (ecdsa), or "keyless-certificate" (for Keyless SSL servers).',
						["origin-rsa", "origin-ecc", "keyless-certificate"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					csr: resolveFileToken(
						argv["csr"] as string | undefined,
						"csr",
						"text"
					),
					hostnames: argv["hostnames"],
					request_type: resolveFileToken(
						argv["request-type"] as string | undefined,
						"request-type",
						"text"
					),
					requested_validity: argv["requested-validity"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.originCaCertificates.create({ ...bodyData } satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
