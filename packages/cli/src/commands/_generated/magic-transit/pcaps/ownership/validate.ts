import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * validate command
 * @generated from apis/overlays/magic-transit.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit pcaps ownership validate\n\nValidates buckets added to the packet captures API."
		)
		.option("destination-conf", {
			type: "string",
			description:
				"The full URI for the bucket. This field only applies to `full` packet captures.",
		})
		.option("ownership-challenge", {
			type: "string",
			description: "The ownership challenge filename stored in the bucket.",
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
	SdkRequest<"magic-pcap-collection-validate-buckets-for-full-packet-captures">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "validate",
	describe: "Validate buckets for full packet captures",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit pcaps ownership validate",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit pcaps ownership validate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pcaps/ownership/validate`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destination_conf: resolveFileToken(
											argv["destination-conf"] as string | undefined,
											"destination-conf",
											"text"
										),
										ownership_challenge: resolveFileToken(
											argv["ownership-challenge"] as string | undefined,
											"ownership-challenge",
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
						client.magicTransit.pcaps.ownership.validate({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["destination-conf"] === undefined) {
					argv["destination-conf"] = await promptForRequiredField(
						"destination-conf",
						"The full URI for the bucket. This field only applies to \`full\` packet captures."
					);
				}
				if (argv["ownership-challenge"] === undefined) {
					argv["ownership-challenge"] = await promptForRequiredField(
						"ownership-challenge",
						"The ownership challenge filename stored in the bucket."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destination_conf: resolveFileToken(
						argv["destination-conf"] as string | undefined,
						"destination-conf",
						"text"
					),
					ownership_challenge: resolveFileToken(
						argv["ownership-challenge"] as string | undefined,
						"ownership-challenge",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.magicTransit.pcaps.ownership.validate({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
