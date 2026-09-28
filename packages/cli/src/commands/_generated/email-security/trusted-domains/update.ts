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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security trusted-domains update <trusted-domain-id>\n\nReplaces an existing trusted domain in full. Unlike PATCH, every field is taken from the request body, so optional fields that are omitted are reset rather than left untouched. Use this when managing trusted domains declaratively."
		)
		.positional("trusted-domain-id", {
			type: "string",
			description: "Trusted domain identifier.",
			demandOption: true,
		})
		.option("comments", { type: "string", description: "The comments field" })
		.option("is-recent", {
			type: "boolean",
			description:
				"Select to prevent recently registered domains from triggering a Suspicious or Malicious disposition.",
		})
		.option("is-regex", { type: "boolean", description: "The is_regex field" })
		.option("is-similarity", {
			type: "boolean",
			description:
				"Select for partner or other approved domains that have similar spelling to your connected domains. Prevents listed domains from triggering a Spoof disposition.",
		})
		.option("pattern", { type: "string", description: "The pattern field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Create a trusted domain.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_replace_trusted_domain">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <trusted-domain-id>",
	describe: "Replace a trusted email domain",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security trusted-domains update",
				classification: {
					safeFlags: ["is-recent", "is-regex", "is-similarity", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security trusted-domains update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/trusted_domains/${argv["trusted-domain-id"] == null ? "<trusted-domain-id>" : encodeURIComponent(String(argv["trusted-domain-id"]))}`,
						pathParams: {
							"trusted-domain-id": String(argv["trusted-domain-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comments: resolveFileToken(
											argv["comments"] as string | undefined,
											"comments",
											"text"
										),
										is_recent: argv["is-recent"],
										is_regex: argv["is-regex"],
										is_similarity: argv["is-similarity"],
										pattern: resolveFileToken(
											argv["pattern"] as string | undefined,
											"pattern",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.emailSecurity.trustedDomains.update({
							body: bodyData,
							account_id: accountId,
							trusted_domain_id: argv["trusted-domain-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["is-recent"] === undefined) {
					throw new Error(
						"--is-recent is required (or pass --body with this field set)."
					);
				}
				if (argv["is-regex"] === undefined) {
					throw new Error(
						"--is-regex is required (or pass --body with this field set)."
					);
				}
				if (argv["is-similarity"] === undefined) {
					throw new Error(
						"--is-similarity is required (or pass --body with this field set)."
					);
				}
				if (argv["pattern"] === undefined) {
					argv["pattern"] = await promptForRequiredField(
						"pattern",
						"The pattern field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					is_recent: argv["is-recent"],
					is_regex: argv["is-regex"],
					is_similarity: argv["is-similarity"],
					pattern: resolveFileToken(
						argv["pattern"] as string | undefined,
						"pattern",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.emailSecurity.trustedDomains.update({
						body: bodyData,
						account_id: accountId,
						trusted_domain_id: argv["trusted-domain-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
