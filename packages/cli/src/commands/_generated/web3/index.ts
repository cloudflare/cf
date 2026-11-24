import $hostnames from "./hostnames/index.js";
/**
 * web3 command
 * @generated from apis/overlays/web3.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "web3",
	describe:
		"Web3 gateways — serve IPFS and Ethereum content through custom hostnames on Cloudflare",

	routes: {
		hostnames: $hostnames,
	},
});

export default command;
