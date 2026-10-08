/** @generated from workers.deployments.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/scripts/{script_name}/deployments",
	query: ["force"],
	body: "json",
	constants: {
		strategy: "percentage",
	},
} as const;
