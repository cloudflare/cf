import $rules from "./rules/index.js";
/**
 * cloud-connector command
 * @generated from apis/overlays/cloud-connector.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cloud-connector",
	describe:
		"Route traffic from Cloudflare directly to cloud provider services (AWS, Azure, GCP) without origin servers",

	routes: {
		rules: $rules,
	},
});

export default command;
