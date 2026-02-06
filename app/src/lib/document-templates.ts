// Document template definitions with field schemas and HTML content generators
// for Tennessee Juvenile Court documents

export interface TemplateField {
  id: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "number" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  autoPopulate?: "child_initials" | "case_number" | "attorney" | "judge_name" | "county" | "court_name" | "date_today";
}

export interface TemplateDefinition {
  id: string;
  fields: TemplateField[];
  generate: (values: Record<string, string>, profile: { full_name: string; title: string; county: string; settings: Record<string, string> }) => string;
}

const header = (p: { county: string; court_name: string }) =>
  `<div style="text-align:center;margin-bottom:24px">
<div style="font-size:14px;font-weight:bold;text-transform:uppercase">STATE OF TENNESSEE</div>
<div style="font-size:13px;font-weight:bold">${p.court_name || "JUVENILE COURT"}</div>
<div style="font-size:12px">${p.county ? p.county.toUpperCase() + " COUNTY" : ""}</div>
<hr style="border:1px solid #000;margin:12px 0"/>
</div>`;

const signatureBlock = (p: { judge_name: string; title: string; date: string }) =>
  `<div style="margin-top:48px">
<div style="margin-bottom:32px;text-align:right">
<div>Date: <span style="border-bottom:1px solid #000;display:inline-block;width:180px;text-align:center">${p.date}</span></div>
</div>
<div style="text-align:right">
<div style="border-bottom:1px solid #000;display:inline-block;width:280px;text-align:center;padding-bottom:4px">${p.judge_name}</div>
<div style="font-size:11px;text-align:center;display:inline-block;width:280px">${p.title}</div>
</div>
</div>`;

const caseCaption = (v: Record<string, string>) =>
  `<table style="width:100%;margin-bottom:16px;font-size:13px">
<tr>
<td style="width:50%">In the Matter of:<br/><strong>${v.child_initials || "____"}</strong>, a child</td>
<td style="width:50%;text-align:right">Case No.: <strong>${v.case_number || "____"}</strong></td>
</tr>
</table>`;

export const templateDefinitions: Record<string, TemplateDefinition> = {
  "detention-order": {
    id: "detention-order",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "child_age", label: "Child Age", type: "number", required: true },
      { id: "offense", label: "Alleged Offense", type: "textarea", required: true, placeholder: "Description of the alleged delinquent act" },
      { id: "detention_reason", label: "Reason for Detention", type: "select", required: true, options: [
        { value: "flight_risk", label: "Risk of flight from jurisdiction" },
        { value: "danger_community", label: "Danger to community" },
        { value: "danger_self", label: "Danger to self" },
        { value: "no_parent", label: "No parent/guardian available" },
        { value: "prior_failure", label: "Prior failure to appear" },
      ]},
      { id: "detention_facility", label: "Detention Facility", type: "text", required: true, placeholder: "Name of detention facility" },
      { id: "next_hearing_date", label: "Next Hearing Date", type: "date", required: true },
      { id: "additional_conditions", label: "Additional Conditions", type: "textarea", placeholder: "Any additional conditions or orders" },
      { id: "order_date", label: "Order Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => {
      const reasonMap: Record<string, string> = {
        flight_risk: "there is a risk that the child will flee the jurisdiction",
        danger_community: "the child poses a danger to the community",
        danger_self: "the child poses a danger to themselves",
        no_parent: "no parent, guardian, or custodian is available to assume custody",
        prior_failure: "the child has a history of failure to appear for court proceedings",
      };
      return `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">ORDER OF DETENTION</h2>
<div style="font-size:13px;line-height:1.8">
<p>This matter having come before the Court, and the Court having considered the petition, evidence presented, and the requirements of T.C.A. &sect; 37-1-114, the Court finds and orders as follows:</p>
<p><strong>1. FINDINGS:</strong> The child, <strong>${v.child_initials}</strong>, age ${v.child_age}, is alleged to have committed: ${v.offense}</p>
<p><strong>2. BASIS FOR DETENTION:</strong> The Court finds that detention is warranted because ${reasonMap[v.detention_reason] || v.detention_reason}. Pursuant to T.C.A. &sect; 37-1-114(c), the Court has determined that no less restrictive alternative is appropriate.</p>
<p><strong>3. IT IS THEREFORE ORDERED</strong> that the child shall be detained at <strong>${v.detention_facility}</strong> pending further proceedings.</p>
<p><strong>4. HEARING:</strong> A detention review hearing shall be held on or before <strong>${v.next_hearing_date}</strong>, as required by T.C.A. &sect; 37-1-117.</p>
${v.additional_conditions ? `<p><strong>5. ADDITIONAL CONDITIONS:</strong> ${v.additional_conditions}</p>` : ""}
</div>
${signatureBlock({ judge_name: p.full_name, title: p.title + (p.county ? ", " + p.county + " County" : ""), date: v.order_date })}`;
    },
  },

  "disposition-order": {
    id: "disposition-order",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "child_age", label: "Child Age", type: "number", required: true },
      { id: "adjudicated_offense", label: "Adjudicated Offense", type: "textarea", required: true, placeholder: "The offense(s) the child was adjudicated for" },
      { id: "disposition_type", label: "Disposition Type", type: "select", required: true, options: [
        { value: "probation", label: "Probation" },
        { value: "commitment", label: "Commitment to DCS custody" },
        { value: "suspended_commitment", label: "Suspended commitment" },
        { value: "community_service", label: "Community service" },
        { value: "restitution", label: "Restitution" },
        { value: "diversion", label: "Judicial diversion" },
      ]},
      { id: "duration", label: "Duration", type: "text", placeholder: "e.g., 12 months" },
      { id: "conditions", label: "Conditions of Disposition", type: "textarea", required: true, placeholder: "List all conditions, one per line" },
      { id: "counseling", label: "Counseling/Treatment Required", type: "textarea", placeholder: "Substance abuse, mental health, etc." },
      { id: "review_date", label: "Review Hearing Date", type: "date" },
      { id: "order_date", label: "Order Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => {
      const dispMap: Record<string, string> = {
        probation: "placed on supervised probation",
        commitment: "committed to the custody of the Department of Children's Services",
        suspended_commitment: "given a suspended commitment to DCS custody",
        community_service: "ordered to perform community service",
        restitution: "ordered to pay restitution",
        diversion: "granted judicial diversion",
      };
      return `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">DISPOSITION ORDER</h2>
<div style="font-size:13px;line-height:1.8">
<p>This matter having come before the Court for disposition, and the Court having considered the social study, evidence presented, and the best interests of the child pursuant to T.C.A. &sect; 37-1-131, the Court finds and orders as follows:</p>
<p><strong>1. ADJUDICATION:</strong> The child, <strong>${v.child_initials}</strong>, age ${v.child_age}, having been adjudicated for: ${v.adjudicated_offense}</p>
<p><strong>2. DISPOSITION:</strong> The child is hereby ${dispMap[v.disposition_type] || v.disposition_type}${v.duration ? " for a period of " + v.duration : ""}.</p>
<p><strong>3. CONDITIONS:</strong></p>
<div style="margin-left:24px">${v.conditions.split("\n").map(c => c.trim()).filter(Boolean).map((c, i) => `<p>${String.fromCharCode(97 + i)}) ${c}</p>`).join("")}</div>
${v.counseling ? `<p><strong>4. TREATMENT:</strong> The child shall participate in the following treatment/counseling: ${v.counseling}</p>` : ""}
${v.review_date ? `<p><strong>${v.counseling ? "5" : "4"}. REVIEW:</strong> This matter shall be reviewed on <strong>${v.review_date}</strong>.</p>` : ""}
</div>
${signatureBlock({ judge_name: p.full_name, title: p.title + (p.county ? ", " + p.county + " County" : ""), date: v.order_date })}`;
    },
  },

  "transfer-order": {
    id: "transfer-order",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "child_age", label: "Child Age", type: "number", required: true },
      { id: "offense", label: "Alleged Offense", type: "textarea", required: true },
      { id: "transfer_basis", label: "Statutory Basis for Transfer", type: "textarea", required: true, placeholder: "Findings under T.C.A. 37-1-134 factors" },
      { id: "receiving_court", label: "Receiving Court", type: "text", required: true, placeholder: "e.g., Criminal Court of Tipton County" },
      { id: "order_date", label: "Order Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">ORDER OF TRANSFER</h2>
<div style="font-size:13px;line-height:1.8">
<p>This matter having come before the Court on the State's motion to transfer jurisdiction, and the Court having conducted a hearing pursuant to T.C.A. &sect; 37-1-134, the Court finds and orders as follows:</p>
<p><strong>1.</strong> The child, <strong>${v.child_initials}</strong>, age ${v.child_age}, is alleged to have committed: ${v.offense}</p>
<p><strong>2. FINDINGS UNDER T.C.A. &sect; 37-1-134:</strong> The Court has considered the following factors and finds:</p>
<div style="margin-left:24px">${v.transfer_basis}</div>
<p><strong>3. IT IS THEREFORE ORDERED</strong> that this case is hereby transferred to the <strong>${v.receiving_court}</strong> for prosecution as an adult. The Clerk shall transmit all records to the receiving court forthwith.</p>
</div>
${signatureBlock({ judge_name: p.full_name, title: p.title + (p.county ? ", " + p.county + " County" : ""), date: v.order_date })}`,
  },

  "release-order": {
    id: "release-order",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "release_to", label: "Release To", type: "text", required: true, placeholder: "Name and relationship of responsible party" },
      { id: "release_conditions", label: "Conditions of Release", type: "textarea", placeholder: "Curfew, school attendance, no contact orders, etc." },
      { id: "next_hearing_date", label: "Next Hearing Date", type: "date" },
      { id: "order_date", label: "Order Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">ORDER OF RELEASE</h2>
<div style="font-size:13px;line-height:1.8">
<p>This matter having come before the Court, and the Court having determined that continued detention is no longer necessary, IT IS HEREBY ORDERED:</p>
<p><strong>1.</strong> The child, <strong>${v.child_initials}</strong>, is hereby released from detention to the custody of <strong>${v.release_to}</strong>.</p>
${v.release_conditions ? `<p><strong>2. CONDITIONS OF RELEASE:</strong></p><div style="margin-left:24px">${v.release_conditions.split("\n").map(c => c.trim()).filter(Boolean).map((c, i) => `<p>${String.fromCharCode(97 + i)}) ${c}</p>`).join("")}</div>` : ""}
${v.next_hearing_date ? `<p><strong>${v.release_conditions ? "3" : "2"}.</strong> The next hearing in this matter is scheduled for <strong>${v.next_hearing_date}</strong>.</p>` : ""}
</div>
${signatureBlock({ judge_name: p.full_name, title: p.title + (p.county ? ", " + p.county + " County" : ""), date: v.order_date })}`,
  },

  "summons": {
    id: "summons",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "respondent_name", label: "Respondent Name", type: "text", required: true, placeholder: "Person being summoned" },
      { id: "respondent_relation", label: "Relationship to Child", type: "select", required: true, options: [
        { value: "parent", label: "Parent" },
        { value: "guardian", label: "Legal Guardian" },
        { value: "custodian", label: "Custodian" },
        { value: "child", label: "Juvenile (child)" },
      ]},
      { id: "hearing_date", label: "Hearing Date", type: "date", required: true },
      { id: "hearing_time", label: "Hearing Time", type: "text", required: true, placeholder: "e.g., 9:00 AM" },
      { id: "hearing_type", label: "Hearing Type", type: "select", required: true, options: [
        { value: "preliminary", label: "Preliminary Hearing" },
        { value: "adjudicatory", label: "Adjudicatory Hearing" },
        { value: "disposition", label: "Disposition Hearing" },
        { value: "review", label: "Review Hearing" },
        { value: "detention_review", label: "Detention Review" },
      ]},
      { id: "courtroom", label: "Courtroom / Location", type: "text", placeholder: "e.g., Courtroom A" },
      { id: "order_date", label: "Issue Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">SUMMONS</h2>
<div style="font-size:13px;line-height:1.8">
<p><strong>TO:</strong> ${v.respondent_name} (${v.respondent_relation})</p>
<p>A petition has been filed in this Court concerning the above-named child. <strong>YOU ARE HEREBY COMMANDED</strong> to appear before this Court at the time and place stated below:</p>
<table style="margin:16px 0;font-size:13px">
<tr><td style="padding:4px 16px 4px 0;font-weight:bold">Hearing Type:</td><td>${v.hearing_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</td></tr>
<tr><td style="padding:4px 16px 4px 0;font-weight:bold">Date:</td><td>${v.hearing_date}</td></tr>
<tr><td style="padding:4px 16px 4px 0;font-weight:bold">Time:</td><td>${v.hearing_time}</td></tr>
${v.courtroom ? `<tr><td style="padding:4px 16px 4px 0;font-weight:bold">Location:</td><td>${v.courtroom}</td></tr>` : ""}
</table>
<p><strong>NOTICE:</strong> Failure to appear may result in a finding of contempt of court and the issuance of a capias for your arrest. You have the right to be represented by an attorney. If you cannot afford an attorney, one may be appointed for you.</p>
<p>Pursuant to T.C.A. &sect; 37-1-115, this summons shall be served upon the respondent at least 48 hours before the hearing.</p>
</div>
${signatureBlock({ judge_name: p.full_name, title: p.title + (p.county ? ", " + p.county + " County" : ""), date: v.order_date })}`,
  },

  "petition-delinquent": {
    id: "petition-delinquent",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "child_age", label: "Child Age", type: "number", required: true },
      { id: "child_dob", label: "Child Date of Birth", type: "date", required: true },
      { id: "parent_name", label: "Parent/Guardian Name", type: "text", required: true },
      { id: "allegations", label: "Allegations", type: "textarea", required: true, placeholder: "On or about [date], the child did commit the offense of..." },
      { id: "tca_code", label: "T.C.A. Section Violated", type: "text", required: true, placeholder: "e.g., T.C.A. 39-14-103 (Theft)" },
      { id: "petitioner_name", label: "Petitioner Name", type: "text", required: true, placeholder: "Name of petitioning party" },
      { id: "petitioner_title", label: "Petitioner Title", type: "text", placeholder: "e.g., Assistant District Attorney" },
      { id: "petition_date", label: "Petition Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">PETITION — DELINQUENT CHILD</h2>
<div style="font-size:13px;line-height:1.8">
<p>Comes now the Petitioner and respectfully represents to this Honorable Court:</p>
<p><strong>1.</strong> The child, <strong>${v.child_initials}</strong>, born ${v.child_dob}, age ${v.child_age}, is a child within the jurisdiction of this Court pursuant to T.C.A. &sect; 37-1-103.</p>
<p><strong>2.</strong> The parent/guardian of said child is <strong>${v.parent_name}</strong>.</p>
<p><strong>3. ALLEGATIONS:</strong> ${v.allegations}</p>
<p><strong>4.</strong> Said conduct, if committed by an adult, would constitute a violation of <strong>${v.tca_code}</strong>.</p>
<p><strong>5.</strong> WHEREFORE, the Petitioner prays that this Court assume jurisdiction over said child and make such orders as are in the best interest of the child and the public.</p>
<div style="margin-top:48px">
<div style="border-bottom:1px solid #000;display:inline-block;width:280px;text-align:center;padding-bottom:4px">${v.petitioner_name}</div>
<div style="font-size:11px">${v.petitioner_title || "Petitioner"}</div>
<div style="margin-top:8px;font-size:12px">Date: ${v.petition_date}</div>
</div>
</div>`,
  },

  "petition-dependent": {
    id: "petition-dependent",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "child_age", label: "Child Age", type: "number", required: true },
      { id: "child_dob", label: "Child Date of Birth", type: "date", required: true },
      { id: "parent_names", label: "Parent(s)/Guardian(s)", type: "textarea", required: true, placeholder: "Name(s) and relationship(s)" },
      { id: "allegations", label: "Allegations of Dependency/Neglect", type: "textarea", required: true, placeholder: "Describe the conditions constituting dependency or neglect" },
      { id: "petitioner_agency", label: "Petitioning Agency", type: "text", required: true, placeholder: "e.g., Department of Children's Services" },
      { id: "petitioner_name", label: "Caseworker/Petitioner Name", type: "text", required: true },
      { id: "petition_date", label: "Petition Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">PETITION — DEPENDENT AND NEGLECTED CHILD</h2>
<div style="font-size:13px;line-height:1.8">
<p>Comes now <strong>${v.petitioner_agency}</strong>, by and through <strong>${v.petitioner_name}</strong>, and respectfully petitions this Court as follows:</p>
<p><strong>1.</strong> The child, <strong>${v.child_initials}</strong>, born ${v.child_dob}, age ${v.child_age}, is believed to be a dependent and neglected child within the meaning of T.C.A. &sect; 37-1-102(b)(13).</p>
<p><strong>2. PARENTS/GUARDIANS:</strong></p>
<div style="margin-left:24px">${v.parent_names}</div>
<p><strong>3. ALLEGATIONS:</strong> ${v.allegations}</p>
<p><strong>4.</strong> The above conditions place the child in danger of substantial harm as defined by T.C.A. &sect; 37-1-102(b)(13) and warrant the intervention of this Court.</p>
<p><strong>5.</strong> WHEREFORE, the Petitioner prays that this Court find said child to be dependent and neglected and make such orders as are in the best interest of the child, including but not limited to temporary custody with the Department of Children's Services.</p>
<div style="margin-top:48px">
<div style="font-size:12px">${v.petitioner_agency}</div>
<div style="margin-top:16px;border-bottom:1px solid #000;display:inline-block;width:280px;text-align:center;padding-bottom:4px">${v.petitioner_name}</div>
<div style="font-size:11px">Caseworker/Petitioner</div>
<div style="margin-top:8px;font-size:12px">Date: ${v.petition_date}</div>
</div>
</div>`,
  },

  "findings-fact": {
    id: "findings-fact",
    fields: [
      { id: "case_number", label: "Case Number", type: "text", required: true, autoPopulate: "case_number" },
      { id: "child_initials", label: "Child Initials", type: "text", required: true, autoPopulate: "child_initials" },
      { id: "hearing_date", label: "Hearing Date", type: "date", required: true },
      { id: "hearing_type", label: "Hearing Type", type: "select", required: true, options: [
        { value: "adjudicatory", label: "Adjudicatory" },
        { value: "disposition", label: "Disposition" },
        { value: "transfer", label: "Transfer" },
        { value: "review", label: "Review" },
      ]},
      { id: "parties_present", label: "Parties Present", type: "textarea", required: true, placeholder: "List all parties present at the hearing" },
      { id: "findings", label: "Findings of Fact", type: "textarea", required: true, placeholder: "Numbered findings of fact" },
      { id: "conclusions", label: "Conclusions of Law", type: "textarea", required: true, placeholder: "Legal conclusions with T.C.A. citations" },
      { id: "order_date", label: "Date", type: "date", required: true, autoPopulate: "date_today" },
    ],
    generate: (v, p) => `${header({ county: p.county, court_name: p.settings?.court_name || "" })}
${caseCaption(v)}
<h2 style="text-align:center;font-size:16px;margin:24px 0">FINDINGS OF FACT AND CONCLUSIONS OF LAW</h2>
<div style="font-size:13px;line-height:1.8">
<p>This matter came before the Court for a <strong>${v.hearing_type.replace(/_/g, " ")}</strong> hearing on <strong>${v.hearing_date}</strong>.</p>
<p><strong>PARTIES PRESENT:</strong></p>
<div style="margin-left:24px">${v.parties_present}</div>
<p style="margin-top:16px"><strong>FINDINGS OF FACT:</strong></p>
<div style="margin-left:24px">${v.findings.split("\n").map(f => f.trim()).filter(Boolean).map((f, i) => `<p>${i + 1}. ${f}</p>`).join("")}</div>
<p style="margin-top:16px"><strong>CONCLUSIONS OF LAW:</strong></p>
<div style="margin-left:24px">${v.conclusions}</div>
</div>
${signatureBlock({ judge_name: p.full_name, title: p.title + (p.county ? ", " + p.county + " County" : ""), date: v.order_date })}`,
  },
};
