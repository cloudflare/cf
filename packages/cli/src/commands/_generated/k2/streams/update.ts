import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/k2.ts
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
			"$0 k2 streams update <stream-id>\n\nUpdate a K2 stream. Omitted `http` settings, such as `authentication` and `cors`, keep their current values. Disabling HTTP keeps them, so enabling HTTP again restores them. At least one input must remain enabled."
		)
		.positional("stream-id", {
			type: "string",
			description: "Specifies the public ID of the K2 stream.",
			demandOption: true,
		})
		.option("http-authentication", {
			type: "boolean",
			description:
				"Indicates whether the HTTP endpoint requires an API token with K2 produce permission. When false, the endpoint accepts unauthenticated records. Defaults to true when HTTP is enabled without a stored value.",
		})
		.option("http-cors-origins", {
			type: "string",
			array: true,
			description:
				"Allows browser requests from these HTTP or HTTPS origins. Use a wildcard only as the sole origin. An empty list blocks cross-origin browser requests. Defaults to `['*']` when HTTP is enabled without stored origins.",
		})
		.option("http-enabled", {
			type: "boolean",
			description: "Indicates whether the HTTP endpoint accepts records.",
		})
		.option("retention-seconds", {
			type: "number",
			description:
				"Sets the record retention period from 1 hour (3600 seconds) to 30 days (2592000 seconds), inclusive.",
		})
		.option("worker-binding-enabled", {
			type: "boolean",
			description:
				"Indicates whether Workers bindings can produce records to the stream.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"http-authentication",
				"http-cors-origins",
				"http-enabled",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["http-enabled"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --http-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = ["worker-binding-enabled"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["worker-binding-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --worker_binding-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"patchV4AccountsByAccount_idK2StreamsByStream_id">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <stream-id>",
	describe: "Update K2 stream",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "k2 streams update",
				classification: {
					safeFlags: [
						"http-authentication",
						"http-enabled",
						"worker-binding-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf k2 streams update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/k2/streams/${argv["stream-id"] == null ? "<stream-id>" : encodeURIComponent(String(argv["stream-id"]))}`,
						pathParams: { "stream-id": String(argv["stream-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										http: {
											authentication: argv["http-authentication"],
											cors: {
												origins: argv["http-cors-origins"],
											},
											enabled: argv["http-enabled"],
										},
										retention_seconds: argv["retention-seconds"],
										worker_binding: {
											enabled: argv["worker-binding-enabled"],
										},
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
						client.k2.streams.update({
							...bodyData,
							account_id: accountId,
							stream_id: argv["stream-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					http: {
						authentication: argv["http-authentication"],
						cors: {
							origins: argv["http-cors-origins"],
						},
						enabled: argv["http-enabled"],
					},
					retention_seconds: argv["retention-seconds"],
					worker_binding: {
						enabled: argv["worker-binding-enabled"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.k2.streams.update({
						...bodyData,
						account_id: accountId,
						stream_id: argv["stream-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
