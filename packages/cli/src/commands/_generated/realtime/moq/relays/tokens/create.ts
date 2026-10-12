import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/realtime.ts
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
			"$0 realtime moq relays tokens create <relay-id>\n\nMints a new relay-scoped token and adds it to the relay's accepted-auth registry. The token value (secret) is shown once in the response. A relay may hold up to 10 tokens; creating an 11th is rejected."
		)
		.positional("relay-id", {
			type: "string",
			description: "Relay unique identifier (32 hex characters).",
			demandOption: true,
		})
		.option("expires", {
			type: "string",
			description:
				"Optional expiry (RFC 3339). Defaults to 1 year from creation;\nrejected if more than 1 year in the future.\n",
		})
		.option("label", {
			type: "string",
			description: "Optional, customer-set label.",
		})
		.option("operations", {
			type: "string",
			array: true,
			description:
				"Non-empty subset of the V1 roles the token is allowed to\nperform. Signed into the token.\n",
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

type Request = SdkRequest<"moq-relays-tokens-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <relay-id>",
	describe: "Create a token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime moq relays tokens create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime moq relays tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/moq/relays/${argv["relay-id"] == null ? "<relay-id>" : encodeURIComponent(String(argv["relay-id"]))}/tokens`,
						pathParams: { "relay-id": String(argv["relay-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expires: resolveFileToken(
											argv["expires"] as string | undefined,
											"expires",
											"text"
										),
										label: resolveFileToken(
											argv["label"] as string | undefined,
											"label",
											"text"
										),
										operations: argv["operations"],
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
						client.realtime.moq.relays.tokens.create({
							...bodyData,
							account_id: accountId,
							relay_id: argv["relay-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["operations"] === undefined) {
					throw new Error(
						"--operations is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					expires: resolveFileToken(
						argv["expires"] as string | undefined,
						"expires",
						"text"
					),
					label: resolveFileToken(
						argv["label"] as string | undefined,
						"label",
						"text"
					),
					operations: argv["operations"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.realtime.moq.relays.tokens.create({
						...bodyData,
						account_id: accountId,
						relay_id: argv["relay-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
