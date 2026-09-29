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
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security impersonation-registry create\n\nCreates a new entry in the impersonation registry to protect against impersonation. Emails attempting to impersonate this identity will be flagged. Supports regex patterns for flexible email matching."
		)
		.option("comments", {
			type: "string",
			description: "Optional note describing the entry.",
		})
		.option("directory-id", {
			type: "number",
			description:
				"Identifier of the directory the entry was synced from, when directory-synced.",
		})
		.option("directory-node-id", {
			type: "number",
			description:
				"Identifier of the directory node the entry was synced from, when directory-synced.",
		})
		.option("email", {
			type: "string",
			description: "Email address (or pattern) of the protected identity.",
		})
		.option("external-directory-node-id", {
			type: "string",
			description: "Deprecated. External identifier of the directory node.",
		})
		.option("is-email-regex", {
			type: "boolean",
			description:
				"Whether `email` is a regular expression instead of a literal address.",
		})
		.option("name", {
			type: "string",
			description: "Display name of the protected identity.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Create an impersonation registry entry.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_create_impersonation_registry">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create impersonation registry entry",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security impersonation-registry create",
				classification: {
					safeFlags: ["is-email-regex", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security impersonation-registry create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/impersonation_registry`,
						pathParams: {},
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
										directory_id: argv["directory-id"],
										directory_node_id: argv["directory-node-id"],
										email: resolveFileToken(
											argv["email"] as string | undefined,
											"email",
											"text"
										),
										external_directory_node_id: resolveFileToken(
											argv["external-directory-node-id"] as string | undefined,
											"external-directory-node-id",
											"text"
										),
										is_email_regex: argv["is-email-regex"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.emailSecurity.impersonationRegistry.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["email"] === undefined) {
					argv["email"] = await promptForRequiredField(
						"email",
						"Email address (or pattern) of the protected identity."
					);
				}
				if (argv["is-email-regex"] === undefined) {
					throw new Error(
						"--is-email-regex is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Display name of the protected identity."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					directory_id: argv["directory-id"],
					directory_node_id: argv["directory-node-id"],
					email: resolveFileToken(
						argv["email"] as string | undefined,
						"email",
						"text"
					),
					external_directory_node_id: resolveFileToken(
						argv["external-directory-node-id"] as string | undefined,
						"external-directory-node-id",
						"text"
					),
					is_email_regex: argv["is-email-regex"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.emailSecurity.impersonationRegistry.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
