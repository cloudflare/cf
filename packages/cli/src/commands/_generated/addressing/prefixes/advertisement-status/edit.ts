import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/addressing.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 addressing prefixes advertisement-status edit <prefix-id>\n\nAdvertise or withdraw the BGP route for a prefix. **Deprecated:** Prefer the BGP Prefixes endpoints, which additionally allow for advertising and withdrawing subnets of an IP prefix."
		)
		.positional("prefix-id", {
			type: "string",
			description: "Identifier of an IP Prefix.",
			demandOption: true,
		})
		.option("advertised", {
			type: "boolean",
			description:
				"Advertisement status of the prefix. If `true`, the BGP route for the prefix is advertised to the Internet. If \n`false`, the BGP route is withdrawn.\n",
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
	SdkRequest<"ip-address-management-dynamic-advertisement-update-prefix-dynamic-advertisement-status">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <prefix-id>",
	describe: "Update Prefix Dynamic Advertisement Status",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing prefixes advertisement-status edit",
				classification: {
					safeFlags: ["advertised", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing prefixes advertisement-status edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/prefixes/${argv["prefix-id"] == null ? "<prefix-id>" : encodeURIComponent(String(argv["prefix-id"]))}/bgp/status`,
						pathParams: { "prefix-id": String(argv["prefix-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										advertised: argv["advertised"],
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
						client.addressing.prefixes.advertisementStatus.edit({
							...bodyData,
							account_id: accountId,
							prefix_id: argv["prefix-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["advertised"] === undefined) {
					throw new Error(
						"--advertised is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					advertised: argv["advertised"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.addressing.prefixes.advertisementStatus.edit({
						...bodyData,
						account_id: accountId,
						prefix_id: argv["prefix-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
