/** @generated from intel.attack-surface-report.issue-types.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/attack-surface-report/issue-types`,
} as const;
