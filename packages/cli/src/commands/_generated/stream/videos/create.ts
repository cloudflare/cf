/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Initiate video uploads using TUS",
	usage:
		"$0 stream videos create\n\nInitiates a video upload using the TUS protocol. On success, the server responds with a status code 201 (created) and includes a `location` header to indicate where the content should be uploaded. Refer to https://tus.io for protocol details.",
	flags: {
		"direct-user": {
			kind: "boolean",
			brief:
				"Provisions a URL to let your end users upload videos directly to Cloudflare Stream without exposing your API token to clients.",
			optional: true,
		},
		"tus-resumable": {
			kind: "parsed",
			brief:
				"Specifies the TUS protocol version. This value must be included in every upload request.\nNotes: The only supported version of TUS protocol is 1.0.0.",
			parse: String,
		},
		"upload-creator": {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"upload-length": {
			kind: "parsed",
			brief:
				"Indicates the size of the entire upload in bytes. The value must be a non-negative integer.",
			parse: String,
		},
		"upload-metadata": {
			kind: "parsed",
			brief:
				"Comma-separated key-value pairs following the TUS protocol specification. Values are Base-64 encoded.\nSupported keys: `name`, `requiresignedurls`, `allowedorigins`, `thumbnailtimestamppct`, `watermark`, `scheduleddeletion`, `maxdurationseconds`, `encodingmode`.\n`encodingmode` accepts `default` or `previewFirst`.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos create",
				classification: {
					safeFlags: ["direct-user", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					direct_user: argv["direct-user"],
				};

				const headers: Record<string, string> = {};
				if (argv["tus-resumable"] !== undefined)
					headers["Tus-Resumable"] = String(argv["tus-resumable"]);
				if (argv["upload-creator"] !== undefined)
					headers["Upload-Creator"] = String(argv["upload-creator"]);
				if (argv["upload-length"] !== undefined)
					headers["Upload-Length"] = String(argv["upload-length"]);
				if (argv["upload-metadata"] !== undefined)
					headers["Upload-Metadata"] = String(argv["upload-metadata"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(client, "POST", `/accounts/${accountId}/stream`, {
						query: queryParams,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
