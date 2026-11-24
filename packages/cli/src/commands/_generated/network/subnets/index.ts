import $cloudflaresource from "./cloudflare-source/index.js";
import $initialresolvedip from "./initial-resolved-ip/index.js";
import $list from "./list.js";
import $warp from "./warp/index.js";
/**
 * subnets command group
 * @generated from apis/overlays/network.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subnets",
	describe: "Operations for subnets",

	routes: {
		list: $list,
		"cloudflare-source": $cloudflaresource,
		"initial-resolved-ip": $initialresolvedip,
		warp: $warp,
	},
});

export default command;
