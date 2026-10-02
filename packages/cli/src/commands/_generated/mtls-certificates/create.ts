import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/mtls-certificates.ts
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
			"$0 mtls-certificates create\n\nUpload a certificate that you want to use with mTLS-enabled Cloudflare services, such as Bring Your Own CA (BYO-CA) for mTLS. To create certificates issued by the Cloudflare managed CA, use the [Create Client Certificate endpoint](/api/resources/client_certificates/methods/create/)."
		)
		.option("ca", {
			type: "boolean",
			description:
				"Indicates whether the certificate is a CA or leaf certificate.",
		})
		.option("certificates", {
			type: "string",
			description: "The uploaded root CA certificate.",
		})
		.option("name", {
			type: "string",
			description:
				"Optional unique name for the certificate. Only used for human readability.",
		})
		.option("private-key", {
			type: "string",
			description:
				"The private key for the certificate. This field is only needed for specific use cases such as using a custom certificate with Zero Trust's block page.",
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

type Request =
	SdkRequest<"m-tls-certificate-management-upload-m-tls-certificate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Upload mTLS certificate",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mtls-certificates create",
				classification: {
					safeFlags: ["ca", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf mtls-certificates create",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/mtls_certificates`,
							pathParams: {},
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											ca: argv["ca"],
											certificates: resolveFileToken(
												argv["certificates"] as string | undefined,
												"certificates",
												"text"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											private_key: resolveFileToken(
												argv["private-key"] as string | undefined,
												"private-key",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["private_key"]] }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.mtlsCertificates.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["ca"] === undefined) {
					throw new Error(
						"--ca is required (or pass --body with this field set)."
					);
				}
				if (argv["certificates"] === undefined) {
					argv["certificates"] = await promptForRequiredField(
						"certificates",
						"The uploaded root CA certificate."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ca: argv["ca"],
					certificates: resolveFileToken(
						argv["certificates"] as string | undefined,
						"certificates",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					private_key: resolveFileToken(
						argv["private-key"] as string | undefined,
						"private-key",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.mtlsCertificates.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
