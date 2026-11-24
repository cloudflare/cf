import operation from "../../_operations/stream/videos/list.js";
/**
 * list command
 * @generated from apis/overlays/stream.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List videos",
	usage:
		"$0 stream videos list\n\nLists up to 1000 videos from a single request. For a specific range, refer to the optional parameters.",
	flags: {
		status: {
			kind: "enum",
			brief:
				"Specifies the processing status for all quality levels for a video.",
			values: [
				"pendingupload",
				"downloading",
				"queued",
				"inprogress",
				"ready",
				"error",
				"live-inprogress",
			],
			optional: true,
		},
		creator: {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Specifies whether the video is `vod` or `live`.",
			optional: true,
			parse: String,
		},
		asc: {
			kind: "boolean",
			brief: "Lists videos in ascending order of creation.",
			optional: true,
		},
		"video-name": {
			kind: "parsed",
			brief:
				"Provides a fast, exact string match on the `name` key in the `meta` field.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Provides a partial word match of the `name` key in the `meta` field. Slow for medium to large video libraries. May be unavailable for very large libraries.",
			optional: true,
			parse: String,
		},
		start: {
			kind: "parsed",
			brief: "Lists videos created after the specified date.",
			optional: true,
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "Lists videos created before the specified date.",
			optional: true,
			parse: String,
		},
		"include-counts": {
			kind: "boolean",
			brief:
				"Includes the total number of videos associated with the submitted query parameters.",
			optional: true,
		},
		id: {
			kind: "parsed",
			brief:
				"Filter by video ID(s). Can be a single ID or a comma-separated list of IDs.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Filter by video name/UID(s). Can be a single name or a comma-separated list.",
			optional: true,
			parse: String,
		},
		"live-input-id": {
			kind: "parsed",
			brief:
				"Filter by live input ID to find videos associated with a specific live stream.",
			optional: true,
			parse: String,
		},
		before: {
			kind: "parsed",
			brief:
				"Alias for 'end'. Returns videos created before this date/time (RFC 3339 format).",
			optional: true,
			parse: String,
		},
		after: {
			kind: "parsed",
			brief:
				"Alias for 'start'. Returns videos created after this date/time (RFC 3339 format).",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of videos to return (default 1000, max 1000).",
			optional: true,
			parse: Number,
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
				command: "stream videos list",
				classification: {
					safeFlags: ["status", "asc", "include-counts", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
