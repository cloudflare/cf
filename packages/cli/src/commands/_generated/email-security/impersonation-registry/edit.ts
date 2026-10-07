import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/email-security.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security impersonation-registry edit <impersonation-registry-id>\n\nUpdates an existing impersonation registry entry. Only provided fields will be modified. Directory-synced entries can't be updated."
		)
		.positional("impersonation-registry-id", {
			type: "string",
			description: "Impersonation registry entry identifier.",
			demandOption: true,
		})
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
		.option("provenance", {
			type: "string",
			description: "Source the entry was created from.",
			choices: [
				"A1S_INTERNAL",
				"SNOOPY-CASB_OFFICE_365",
				"SNOOPY-OFFICE_365",
				"SNOOPY-GOOGLE_DIRECTORY",
			],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Update an impersonation registry entry.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_update_impersonation_registry">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <impersonation-registry-id>",
	describe: "Update an impersonation registry entry",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security impersonation-registry edit",
				classification: {
					safeFlags: ["is-email-regex", "provenance", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security impersonation-registry edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/impersonation_registry/${argv["impersonation-registry-id"] == null ? "<impersonation-registry-id>" : encodeURIComponent(String(argv["impersonation-registry-id"]))}`,
						pathParams: {
							"impersonation-registry-id": String(
								argv["impersonation-registry-id"] ?? ""
							),
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
										provenance: resolveFileToken(
											argv["provenance"] as string | undefined,
											"provenance",
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
					const result = await withProgress(`Updating`, async () =>
						client.emailSecurity.impersonationRegistry.edit({
							...bodyData,
							account_id: accountId,
							impersonation_registry_id: argv["impersonation-registry-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
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
					provenance: resolveFileToken(
						argv["provenance"] as string | undefined,
						"provenance",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.emailSecurity.impersonationRegistry.edit({
						...bodyData,
						account_id: accountId,
						impersonation_registry_id: argv["impersonation-registry-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
