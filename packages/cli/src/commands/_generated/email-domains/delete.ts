import operation from "../_operations/email-domains/delete.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * delete command
 * @generated from apis/overlays/email-domains.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-domains delete <email-domain-id>\n\nRequires an empty body. Unclaimed, unpublished candidates are removed immediately after token retirement. Acquired or published resources retain deleting state and claims until the deletion worker acknowledges safe revocation and token retirement: deletion completes after the last authorization FWDR may still hold has expired, up to about 31 minutes after the request. Until then the hostname and client_reference cannot be enrolled again. Repeated requests while deleting are idempotent. Retry-After is the expected time until GET returns 404; follow the Location header after it. Available only to the configured OpenAI pilot account behind a default-off gate; while the gate is off, the pilot account gets 503 with error 2090 and Retry-After, and existing domains are unaffected. Unsupported methods return 405 with error 2091. Authentication failures may use the gateway error envelope."
		)
		.positional("email-domain-id", {
			type: "string",
			description: "Email domain ID",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <email-domain-id>",
	describe: "Delete an Email Domain",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-domains delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-domains delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/domains/${argv["email-domain-id"] == null ? "<email-domain-id>" : encodeURIComponent(String(argv["email-domain-id"]))}`,
						pathParams: {
							"email-domain-id": String(argv["email-domain-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						email_domain_id: argv["email-domain-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
