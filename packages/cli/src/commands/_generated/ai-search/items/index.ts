import $chunks from "./chunks.js";
import $delete from "./delete.js";
import $download from "./download.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs.js";
import $sync from "./sync.js";
import $upload from "./upload.js";
import $upsert from "./upsert.js";
/**
 * items command group
 * @generated from apis/overlays/ai-search.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "items",
	describe: "Content indexed by AI Search instances",

	routes: {
		chunks: $chunks,
		delete: $delete,
		download: $download,
		get: $get,
		list: $list,
		logs: $logs,
		sync: $sync,
		upload: $upload,
		upsert: $upsert,
	},
});

export default command;
