import $accountdatasets from "./account-datasets/index.js";
import $accountjobs from "./account-jobs/index.js";
import $accountownership from "./account-ownership/index.js";
import $accountvalidate from "./account-validate/index.js";
import $edge from "./edge/index.js";
import $transformers from "./transformers/index.js";
/**
 * logpush command
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "logpush",
	describe: "logpush",

	routes: {
		"account-datasets": $accountdatasets,
		"account-jobs": $accountjobs,
		"account-ownership": $accountownership,
		"account-validate": $accountvalidate,
		edge: $edge,
		transformers: $transformers,
	},
});

export default command;
