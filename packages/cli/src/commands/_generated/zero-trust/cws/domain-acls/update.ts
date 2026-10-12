import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws domain-acls update <domain-acl-id>\n\nReplaces the domain access control list's name, default action, and entries."
		)
		.positional("domain-acl-id", {
			type: "string",
			description: "ID of the domain ACL to update",
			demandOption: true,
		})
		.option("default-action", {
			type: "string",
			description: "Default action when no entry matches",
			choices: ["ALLOW", "BLOCK"],
		})
		.coerce("default-action", (value) =>
			resolveFileToken(value, "default-action", "text")
		)
		.option("entries", {
			type: "string",
			description:
				"Replacement set of domain entries. Each domain must appear at most once. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("name", { type: "string", description: "Name of the domain ACL" })
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

type Request = SdkRequest<"cws-update-domain-acl">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <domain-acl-id>",
	describe: "Update a domain ACL and replace its entries",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws domain-acls update",
				classification: {
					safeFlags: ["default-action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws domain-acls update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/domain-acls/${argv["domain-acl-id"] == null ? "<domain-acl-id>" : encodeURIComponent(String(argv["domain-acl-id"]))}`,
						pathParams: {
							"domain-acl-id": String(argv["domain-acl-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default_action: argv["default-action"],
										entries: parseObjectArray(argv["entries"], "entries"),
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
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.cws.domainAcls.update({
							...bodyData,
							account_id: accountId,
							domain_acl_id: argv["domain-acl-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["default-action"] === undefined) {
					argv["default-action"] = await promptForRequiredEnumField(
						"default-action",
						"Default action when no entry matches",
						["ALLOW", "BLOCK"] as const
					);
				}
				if (argv["entries"] === undefined) {
					throw new Error(
						"--entries is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the domain ACL"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					default_action: argv["default-action"],
					entries: parseObjectArray(argv["entries"], "entries"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.cws.domainAcls.update({
						...bodyData,
						account_id: accountId,
						domain_acl_id: argv["domain-acl-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
