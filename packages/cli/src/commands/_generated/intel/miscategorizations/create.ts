import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/intel.ts
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
			"$0 intel miscategorizations create\n\nAllows you to submit requests to change a domain’s category. Requests that include category `169` (New Domains) or category `177` (Newly Seen) in any of `content_adds`, `content_removes`, `security_adds`, or `security_removes` will be rejected with a `400 Bad Request`. These categories are automatically managed and fall off 30 days after they are applied."
		)
		.option("content-adds", {
			type: "string",
			array: true,
			description: "Content category IDs to add.",
		})
		.option("content-removes", {
			type: "string",
			array: true,
			description: "Content category IDs to remove.",
		})
		.option("indicator-type", {
			type: "string",
			description: "The indicator_type field",
			choices: ["domain", "ipv4", "ipv6", "url"],
		})
		.coerce("indicator-type", (value: string | undefined) =>
			resolveFileToken(value, "indicator-type", "text")
		)
		.option("ip", {
			type: "string",
			description: "Provide only if indicator_type is `ipv4` or `ipv6`.",
		})
		.option("security-adds", {
			type: "string",
			array: true,
			description: "Security category IDs to add.",
		})
		.option("security-removes", {
			type: "string",
			array: true,
			description: "Security category IDs to remove.",
		})
		.option("url", {
			type: "string",
			description:
				"Provide only if indicator_type is `domain` or `url`. Example if indicator_type is `domain`: `example.com`. Example if indicator_type is `url`: `https://example.com/news/`.",
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

type Request = SdkRequest<"miscategorization-create-miscategorization">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Miscategorization",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel miscategorizations create",
				classification: {
					safeFlags: ["indicator-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel miscategorizations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/miscategorization`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										content_adds: argv["content-adds"],
										content_removes: argv["content-removes"],
										indicator_type: argv["indicator-type"],
										ip: resolveFileToken(
											argv["ip"] as string | undefined,
											"ip",
											"text"
										),
										security_adds: argv["security-adds"],
										security_removes: argv["security-removes"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
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
						client.intel.miscategorizations.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					content_adds: argv["content-adds"],
					content_removes: argv["content-removes"],
					indicator_type: argv["indicator-type"],
					ip: resolveFileToken(argv["ip"] as string | undefined, "ip", "text"),
					security_adds: argv["security-adds"],
					security_removes: argv["security-removes"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.intel.miscategorizations.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
