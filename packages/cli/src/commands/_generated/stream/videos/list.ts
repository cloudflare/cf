/**
 * list command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List videos",
	usage:
		"$0 stream videos list\n\nLists up to 1000 videos from a single request. For a specific range, refer to the optional parameters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
