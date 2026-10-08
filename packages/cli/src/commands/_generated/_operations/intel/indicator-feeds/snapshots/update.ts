/** @generated from intel.indicator-feeds.snapshots.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/intel/indicator-feeds/{feed_id}/snapshot",
	headers: ["Cf-Async-Upload"],
	body: "form",
	errors: {
		413: "ContentTooLargeError",
	},
} as const;
