import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns settings account nameserver-sets create\n\nCreates an immutable Custom Nameserver Set. To change a set, create a new one, move any zone assignments, and delete the old set."
		)
		.option("advanced", {
			type: "boolean",
			description:
				"Whether to allocate the nameservers from distinct Advanced anycast groups.",
			default: false,
		})
		.option("ip-set", {
			type: "number",
			description:
				"Selects the account-specific IP set that supplies the nameserver addresses. Nameserver sets with the same `ip_set` and `advanced` value may reuse addresses; otherwise, they use disjoint address groups.",
			default: 1,
		})
		.option("nameservers", {
			type: "string",
			description:
				"Lists each nameserver and the number of addresses to allocate to it. Requires a unique name for each entry in the set. Provide as a JSON array of objects or @path/to/file.json.",
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
	SdkRequest<"dns-settings-for-an-account-create-custom-nameserver-set">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Custom Nameserver Set",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns settings account nameserver-sets create",
				classification: {
					safeFlags: ["advanced", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns settings account nameserver-sets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_settings/nameserver_sets`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										advanced: argv["advanced"],
										ip_set: argv["ip-set"],
										nameservers: parseObjectArray(
											argv["nameservers"],
											"nameservers"
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
						client.dns.settings.account.nameserverSets.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["nameservers"] === undefined) {
					throw new Error(
						"--nameservers is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					advanced: argv["advanced"],
					ip_set: argv["ip-set"],
					nameservers: parseObjectArray(argv["nameservers"], "nameservers"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.dns.settings.account.nameserverSets.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
