import operation from "../../../../_operations/dns/settings/account/nameserver-sets/edit.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * edit command
 * @generated from apis/overlays/dns.ts
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
			"$0 dns settings account nameserver-sets edit <nameserver-set-id>\n\nRenames a Custom Nameserver Set owned by the account. Only name may be supplied; immutable and unknown fields are rejected even if unchanged. An empty object or the existing name is a successful no-op. Requires the account-scoped creation entitlements for the existing set."
		)
		.positional("nameserver-set-id", {
			type: "string",
			description: "Identifier for a nameserver set.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description:
				"Customer-defined name, unique within the account by exact string equality (case-sensitive, with no Unicode normalization). Must be valid UTF-8 and at most 255 UTF-8 bytes, not 255 characters. Only graphical Unicode characters are allowed; leading or trailing whitespace is rejected. The name can be changed without changing the set's nameservers or addresses.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Updates only the customer-defined name. All other fields are rejected, even if unchanged. An empty object or the current name succeeds without changing the set. A null name is invalid. Requires the account-scoped creation entitlements, including eligibility for the set's current IP set and the Advanced entitlement for an Advanced set.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <nameserver-set-id>",
	describe: "Update Custom Nameserver Set",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns settings account nameserver-sets edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns settings account nameserver-sets edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_settings/nameserver_sets/${argv["nameserver-set-id"] == null ? "<nameserver-set-id>" : encodeURIComponent(String(argv["nameserver-set-id"]))}`,
						pathParams: {
							"nameserver-set-id": String(argv["nameserver-set-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							nameserver_set_id: argv["nameserver-set-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						nameserver_set_id: argv["nameserver-set-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
