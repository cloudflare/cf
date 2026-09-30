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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 stream videos token create <identifier>\n\nCreates a signed URL token for a video. If a body is not provided in the request, a token is created with default values."
		)
		.positional("identifier", {
			type: "string",
			description: "A Cloudflare-generated unique identifier for a media item.",
			demandOption: true,
		})
		.option("access-rules", {
			type: "string",
			description:
				"The optional list of access rule constraints on the token. Access can be blocked or allowed based on an IP, IP range, or by country. Access rules are evaluated from first to last. If a rule matches, the associated action is applied and no further rules are evaluated. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("downloadable", {
			type: "boolean",
			description:
				"The optional boolean value that enables using signed tokens to access MP4 download links for a video.",
			default: false,
		})
		.option("exp", {
			type: "number",
			description:
				"The optional unix epoch timestamp that specficies the time after a token is not accepted. The maximum time specification is 24 hours from issuing time. If this field is not set, the default is one hour after issuing.",
		})
		.option("flags-original", {
			type: "boolean",
			description:
				"Whether to return the original video without transformations.",
		})
		.option("id", {
			type: "string",
			description:
				"The optional ID of a Stream signing key. If present, the `pem` field is also required.",
		})
		.option("nbf", {
			type: "number",
			description:
				"The optional unix epoch timestamp that specifies the time before a the token is not accepted. If this field is not set, the default is one hour before issuing.",
		})
		.option("pem", {
			type: "string",
			description:
				"The optional base64 encoded private key in PEM format associated with a Stream signing key. If present, the `id` field is also required.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("show-secrets", {
			type: "boolean",
			description: "Show sensitive values in dry-run output",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"stream-videos-create-signed-url-tokens-for-videos">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <identifier>",
	describe: "Create signed URL tokens for videos",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos token create",
				classification: {
					safeFlags: [
						"downloadable",
						"flags-original",
						"dry-run",
						"show-secrets",
						"force",
					],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf stream videos token create",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/token`,
							pathParams: { identifier: String(argv["identifier"] ?? "") },
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											accessRules: parseObjectArray(
												argv["access-rules"],
												"access-rules"
											),
											downloadable: argv["downloadable"],
											exp: argv["exp"],
											flags: {
												original: argv["flags-original"],
											},
											id: resolveFileToken(
												argv["id"] as string | undefined,
												"id",
												"text"
											),
											nbf: argv["nbf"],
											pem: resolveFileToken(
												argv["pem"] as string | undefined,
												"pem",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["pem"]], showSecrets: argv.showSecrets }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Provision temporary token? For use at scale, consider creating a signing key instead.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.stream.videos.token.create({
							...bodyData,
							account_id: accountId,
							identifier: argv["identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					accessRules: parseObjectArray(argv["access-rules"], "access-rules"),
					downloadable: argv["downloadable"],
					exp: argv["exp"],
					flags: {
						original: argv["flags-original"],
					},
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					nbf: argv["nbf"],
					pem: resolveFileToken(
						argv["pem"] as string | undefined,
						"pem",
						"text"
					),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.stream.videos.token.create({
						...bodyData,
						account_id: accountId,
						identifier: argv["identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
