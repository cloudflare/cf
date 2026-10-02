import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/realtime.ts
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
			"$0 realtime moq relays tokens delete <jti>\n\nRevokes a token by removing it from the set the relay accepts. Relays cache that set, so revocation takes effect within seconds rather than instantly, and connections already established with the token are not closed. Revoking an unknown token succeeds, so the call is idempotent."
		)
		.positional("jti", {
			type: "string",
			description: "Token identifier (jti — 32 hex characters).",
			demandOption: true,
		})
		.option("relay-id", {
			type: "string",
			description: "Relay unique identifier (32 hex characters).",
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

type Request = SdkRequest<"moq-relays-tokens-delete">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <jti>",
	describe: "Revoke a token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime moq relays tokens delete",
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
						command: "cf realtime moq relays tokens delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/moq/relays/${argv["relay-id"] == null ? "<relay-id>" : encodeURIComponent(String(argv["relay-id"]))}/tokens/${argv["jti"] == null ? "<jti>" : encodeURIComponent(String(argv["jti"]))}`,
						pathParams: {
							"relay-id": String(argv["relay-id"] ?? ""),
							jti: String(argv["jti"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Revoking this token blocks new connections that present it. Sessions already connected with it stay up.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.realtime.moq.relays.tokens.delete({
						account_id: accountId,
						relay_id: argv["relay-id"],
						jti: argv["jti"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
