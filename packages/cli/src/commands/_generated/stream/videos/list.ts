import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/stream.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 stream videos list\n\nLists up to 1000 videos from a single request. For a specific range, refer to the optional parameters."
		)
		.option("status", {
			type: "string",
			description:
				"Specifies the processing status for all quality levels for a video.",
			choices: [
				"pendingupload",
				"downloading",
				"queued",
				"inprogress",
				"ready",
				"error",
				"live-inprogress",
			],
		})
		.option("creator", {
			type: "string",
			description: "A user-defined identifier for the media creator.",
		})
		.option("type", {
			type: "string",
			description: "Specifies whether the video is `vod` or `live`.",
		})
		.option("asc", {
			type: "boolean",
			description: "Lists videos in ascending order of creation.",
		})
		.option("video-name", {
			type: "string",
			description:
				"Provides a fast, exact string match on the `name` key in the `meta` field.",
		})
		.option("search", {
			type: "string",
			description:
				"Provides a partial word match of the `name` key in the `meta` field. Slow for medium to large video libraries. May be unavailable for very large libraries.",
		})
		.option("start", {
			type: "string",
			description: "Lists videos created after the specified date.",
		})
		.option("end", {
			type: "string",
			description: "Lists videos created before the specified date.",
		})
		.option("include-counts", {
			type: "boolean",
			description:
				"Includes the total number of videos associated with the submitted query parameters.",
		})
		.option("id", {
			type: "string",
			description:
				"Filter by video ID(s). Can be a single ID or a comma-separated list of IDs.",
		})
		.option("name", {
			type: "string",
			description:
				"Filter by video name/UID(s). Can be a single name or a comma-separated list.",
		})
		.option("live-input-id", {
			type: "string",
			description:
				"Filter by live input ID to find videos associated with a specific live stream.",
		})
		.option("before", {
			type: "string",
			description:
				"Alias for 'end'. Returns videos created before this date/time (RFC 3339 format).",
		})
		.option("after", {
			type: "string",
			description:
				"Alias for 'start'. Returns videos created after this date/time (RFC 3339 format).",
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of videos to return (default 1000, max 1000).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"stream-videos-list-videos">;
type Query = SdkQuery<"stream-videos-list-videos">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List videos",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos list",
				classification: {
					safeFlags: ["status", "asc", "include-counts", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					status: argv["status"],
					creator: argv["creator"],
					type: argv["type"],
					asc: argv["asc"],
					video_name: argv["video-name"],
					search: argv["search"],
					start: argv["start"],
					end: argv["end"],
					include_counts: argv["include-counts"],
					id: argv["id"],
					name: argv["name"],
					live_input_id: argv["live-input-id"],
					before: argv["before"],
					after: argv["after"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos list",
						method: "GET",
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

				const result = await withProgress(`Loading`, async () =>
					client.stream.videos.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
