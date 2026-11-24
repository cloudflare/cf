import $aggregaterelevance from "./aggregate-relevance.js";
import $aggregateseverity from "./aggregate-severity.js";
import $bulkmarkread from "./bulk-mark-read.js";
import $getcontent from "./get-content.js";
import $get from "./get.js";
import $list from "./list.js";
import $markread from "./mark-read.js";
import $reprocess from "./reprocess.js";
import $skills from "./skills/index.js";
import $tags from "./tags/index.js";
/**
 * articles command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "articles",
	describe: "Operations for threat-signals.articles",

	routes: {
		"aggregate-relevance": $aggregaterelevance,
		"aggregate-severity": $aggregateseverity,
		"bulk-mark-read": $bulkmarkread,
		get: $get,
		"get-content": $getcontent,
		list: $list,
		"mark-read": $markread,
		reprocess: $reprocess,
		skills: $skills,
		tags: $tags,
	},
});

export default command;
