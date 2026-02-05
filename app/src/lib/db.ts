// Database enum → display string mappings

export const caseTypeDisplay: Record<string, string> = {
  delinquent: "Delinquent",
  dependent_neglect: "Dependent/Neglect",
  unruly: "Unruly",
};

export const caseStatusDisplay: Record<string, string> = {
  active: "Active",
  pending_disposition: "Pending Disposition",
  review: "Review",
  detention_review: "Detention Review",
  closed: "Closed",
};

export const hearingTypeDisplay: Record<string, string> = {
  preliminary: "Preliminary",
  detention_review: "Detention Review",
  adjudicatory: "Adjudicatory",
  disposition: "Disposition",
  review: "Review",
  transfer: "Transfer Hearing",
};

export const documentStatusDisplay: Record<string, string> = {
  draft: "Draft",
  pending_signature: "Pending Signature",
  signed: "Signed",
};

export const documentCategoryDisplay: Record<string, string> = {
  orders: "Orders",
  notices: "Notices",
  petitions: "Petitions",
  findings: "Findings",
};
