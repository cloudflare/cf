import $download from "./download.js";
import $list from "./list.js";
import $upload from "./upload.js";
/**
 * assets command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "assets",
	describe: "Operations for requests.assets",

	routes: {
		download: $download,
		list: $list,
		upload: $upload,
	},
});

export default command;
