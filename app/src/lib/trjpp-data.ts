export interface TRJPPRule {
  id: string;
  title: string;
  part: string;
  partNum: number;
  description: string;
  summary: string;
  text: string;
  tags: string[];
}

export const trjppRules: TRJPPRule[] = [
  {
    id: "101",
    title: "Title of Rules -- Scope -- Purpose and Construction",
    part: "General Provisions",
    partNum: 1,
    description: "Establishes the title, scope, exclusions, and purpose of the Tennessee Rules of Juvenile Practice and Procedure.",
    summary: "Defines these rules as the Tennessee Rules of Juvenile Practice and Procedure, applicable to delinquent, unruly, and dependent and neglect proceedings. Lists exclusions including traffic offenses, parental rights surrenders, and proceedings governed by other rules.",
    text: `RULE 101: TITLE OF RULES -- SCOPE -- PURPOSE AND CONSTRUCTION

(a) Title. These rules shall be known and cited as the Tennessee Rules of Juvenile Practice and Procedure.

(b) Scope. These rules apply to delinquent, unruly, and dependent and neglect proceedings.

(c) Exclusions.

(1) Traffic offenses fall under T.C.A. Section 37-1-146.

(2) Parental rights surrenders are covered by T.C.A. Sections 36-1-111 and 112.

(3) Tennessee Rules of Civil Procedure govern: termination of parental rights (T.C.A. Section 36-1-113); parentage proceedings (T.C.A. Section 36-2-301, et seq); guardianship and mental health matters involving minors; child custody proceedings; grandparent visitation (T.C.A. Section 36-6-306); and civil contempt (T.C.A. Sections 29-9-104 and 105).

(4) General sessions court procedures under Tennessee Rules of Criminal Procedure apply to child abuse prosecutions, nonsupport of children, contributing to delinquency or unruly behavior, contributing to dependency and neglect, offenses involving adults, and criminal contempt.

(5) Tennessee Supreme Court Rules govern proceedings under T.C.A. Sections 37-10-303 and 304.

(d) Purpose and Construction. These rules implement juvenile court purposes by providing speedy and inexpensive procedures while ensuring fairness, protecting party rights, promoting uniform practice, and guiding judicial and legal professionals.`,
    tags: ["scope", "purpose", "exclusions", "jurisdiction", "construction", "applicability"],
  },
  {
    id: "102",
    title: "[Reserved]",
    part: "General Provisions",
    partNum: 1,
    description: "This rule is reserved for future use.",
    summary: "Rule 102 is reserved for future use and contains no substantive provisions.",
    text: `RULE 102: [RESERVED]

This rule is reserved for future use.`,
    tags: ["reserved"],
  },
  {
    id: "103",
    title: "Service of Process and Summons",
    part: "General Provisions",
    partNum: 1,
    description: "Governs service of process and summons procedures in juvenile court proceedings, including timing requirements, methods of service, and waiver provisions.",
    summary: "After petition filing, the clerk schedules hearings and issues summonses. In-state parties require personal service at least 3 days before hearing; out-of-state service may be by registered or certified mail at least 5 days prior. Service by publication is available when parties cannot be located.",
    text: `RULE 103: SERVICE OF PROCESS AND SUMMONS

(a) General Provisions. After petition filing, the clerk schedules a hearing and issues summonses to parties, including children alleged to be delinquent, unruly, or dependent and neglected (if 14 or more years old). A copy of the petition shall accompany the summons unless the summons is served by publication in which case the published summons shall indicate the general nature of the allegations and indicate where to obtain the full petition.

(b) Order to Appear and Bring Child to Hearing. The court may endorse an order on the summons requiring parents, guardians, or custodians to appear personally and bring the child to the hearing.

(c) Service of Summons.

(1) Except for emergency, preliminary, or detention hearings, in-state parties must receive personal service at least 3 days before hearing. If the party cannot be found but their address is known or ascertainable, service may occur by registered or certified mail at least 5 days before the hearing. Out-of-state parties may be served personally or by registered or certified mail at least 5 days prior. Service by mail is complete upon mailing.

(2) If a child is removed from home, service attempts must precede emergency or detention hearings when feasible.

(3) When parties cannot be located after reasonable effort, the court may order service of the summons upon the party by publication in accordance with T.C.A. Sections 21-1-203 and 204.

(4) Any suitable person not a party and at least 18 years old may serve the summons.

(5) Courts may authorize payment of service costs and travel expenses.

(6) Foreign service follows Tennessee Rules of Civil Procedure Rule 4A.

(d) Waiver of Service. Non-child parties may waive service through written stipulation or voluntary appearance.`,
    tags: ["service", "summons", "process", "notice", "publication", "waiver"],
  },
  {
    id: "104",
    title: "Appearance of Attorney",
    part: "General Provisions",
    partNum: 1,
    description: "Governs attorney appearance, continued representation, and prosecuting attorney roles in juvenile court.",
    summary: "Attorneys must notify the court immediately upon undertaking representation and continue until relieved by court order. The district attorney general appears to prosecute on behalf of the state when required by statute or at their discretion.",
    text: `RULE 104: APPEARANCE OF ATTORNEY

(a) Entry of Appearance. An attorney who undertakes to represent a party in any juvenile court action shall immediately notify the court, unless appointed by written order of the court.

(b) Continued Representation. An attorney who has entered an appearance or who has been appointed by the court shall continue such representation until relieved by order of the court.

(c) Prosecuting Attorney. Whenever required by statute or rule, or at his or her discretion, the district attorney general shall appear in the juvenile court and prosecute on behalf of the state.

Advisory Commission Comments:

The Commission emphasizes careful attention to section (b), noting that attorneys remain the official representative of record once appointed or entered unless a court order releases them from that obligation. Additionally, youth services officers and other court staff members should not assume prosecutorial roles in juvenile proceedings, though they may serve as petitioners or witnesses.`,
    tags: ["attorney", "representation", "appearance", "prosecutor", "counsel"],
  },
  {
    id: "105",
    title: "Responsive Pleadings and Motions",
    part: "General Provisions",
    partNum: 1,
    description: "Establishes rules for responsive pleadings and motions in juvenile court, including filing and scheduling requirements.",
    summary: "Written answers to petitions are not required. Motions must be written with specific grounds and requested relief, and must include the anticipated hearing date. Written responses to motions are permitted but not mandated.",
    text: `RULE 105: RESPONSIVE PLEADINGS AND MOTIONS

(a) Answer. A written answer to a petition shall not be required.

(b) Motion.

(1) Court applications for orders must be made by motion. Unless presented during a hearing or trial, motions must be written, state grounds with specificity, and identify the requested relief or order.

(2) Upon motion filing, the clerk schedules a tentative hearing date.

(3) All motions must include the anticipated hearing date and be served on parties a reasonable time prior to that date.

(4) A written response to a motion shall not be required.

Advisory Commission Comments:

This rule replaced the former Rule 20 of Tennessee Rules of Juvenile Procedure. The Commission clarifies that while written responses are not mandated, they remain permissible. Local rules should define reasonable notice timeframes, considering local docket variations. The notes also reference Supreme Court Rule 10B procedures for judge disqualification or recusal motions in juvenile courts.`,
    tags: ["pleadings", "motions", "answer", "filing", "responsive"],
  },
  {
    id: "106",
    title: "Filing and Service of Pleadings and Other Parties",
    part: "General Provisions",
    partNum: 1,
    description: "Comprehensive rules for filing and service of pleadings, including methods of service, proof requirements, electronic and facsimile filing provisions.",
    summary: "Every subsequent pleading, motion, and notice must be served on all parties including children alleged delinquent or unruly, and dependent/neglected children age 14 or older. Service may be made by delivery, mail, or agreed-upon email. Facsimile and electronic filing are permitted with certain exceptions.",
    text: `RULE 106: FILING AND SERVICE OF PLEADINGS AND OTHER PARTIES

(a) Service - When Required. Unless the Court otherwise orders, every order required by its terms to be served; every pleading subsequent to the original petition; and every written motion (other than ex parte), notice, appearance, or similar papers shall be served upon each of the parties, including the child alleged to be delinquent or unruly. Service shall also be made on a child alleged to be dependent and neglected, if age 14 or over. If a court appointed special advocate (CASA) is appointed, the CASA volunteer shall be served in the same manner as a party.

(b) Service - How Made.

(1) Whenever service of a pleading is required or permitted to be made on a party represented by an attorney or guardian ad litem, the service shall be made upon the attorney or guardian ad litem unless service on the party is ordered by the court. Service upon the attorney, guardian ad litem or upon a party shall be made by delivering a copy of the document to be served either in person, by leaving it at the person's office, by leaving it at the person's home in a conspicuous place or with a person of suitable age and discretion residing therein, or by mailing it to such person's last known address. If no address is known, service is completed by leaving a copy with the clerk of the court. Service by mail is complete upon mailing. Items which may be filed by facsimile transmission pursuant to this rule may be served by facsimile transmission.

(2) If all parties, their attorneys or guardians ad litem agree, in writing, service of documents may be made via email in Adobe PDF format in lieu of service by mail. A signed notice of such agreement, containing the email addresses of parties and the attorneys, shall be filed with the clerk.

(c) Service - Proof of. Whenever any pleading or other paper is served, proof of the time and manner of such service shall be filed before action is taken thereon by the court or the parties. Proof may be by certificate of an attorney of record, the clerk, by affidavit of the person who served the papers, or by any other proof satisfactory to the court.

(d) Filing. All papers after the petition required to be served upon a party shall be filed with the court either before service or within a reasonable time thereafter. Discovery need not be filed, unless ordered by the court.

(e) Filing with the Court Defined. The filing of pleadings and other papers with the court as required by these rules shall be made by filing them with the clerk of the court, except that the judge may permit the papers to be filed with the judge, in which event the judge shall note thereon the filing date and immediately transmit them to the office of the clerk. The clerk shall endorse upon every pleading and other papers filed with the clerk in an action the date and hour of the filing. If papers required or permitted to be filed are prepared by or on behalf of a pro se litigant incarcerated in a correctional facility and are not received by the clerk of the court until after the deadline for filing, filing shall be timely if the papers were delivered to the appropriate individual at the correctional facility within the time allowed for filing. This provision shall also apply to service of papers by such litigants. "Correctional facility" shall include a prison, jail, county workhouse or similar institution in which the pro se litigant is incarcerated. Should timeliness of filing or service become an issue, the burden is on the pro se litigant to establish compliance with this provision.

(f) Facsimile Filing. The juvenile court clerk shall accept papers for filing by facsimile transmission as provided in Rule 5A of the Rules of Civil Procedure.

(g) Facsimile Filing Exceptions. The following documents shall not be filed by facsimile transmission:

(1) Any pleading or similar document for which a filing fee must be paid (excluding the facsimile service charge), including, without limitation, a petition, a request for a hearing before the judge from the magistrate's order, or a notice of appeal to a trial court or appellate court; or

(2) A summons; bond; a document requiring an official seal; or a document the court has previously ordered to be filed under seal.

(h) Electronic Filing, Signing, Or Verification. Any juvenile court may, by local rule, allow papers to be filed, signed or verified by electronic means that comply with technological standards promulgated by the Supreme Court. Pleadings and other papers filed electronically under such local rules shall be considered the same as written papers.`,
    tags: ["filing", "service", "pleadings", "facsimile", "electronic filing", "casa"],
  },
  {
    id: "107",
    title: "Subpoenas",
    part: "General Provisions",
    partNum: 1,
    description: "Governs the form, issuance, and service of subpoenas for witnesses and document production in juvenile court proceedings.",
    summary: "Subpoenas are issued by the clerk and must be served at least 5 calendar days prior for witness attendance and 10 calendar days prior for document production. Exceptions apply for emergency, preliminary, and detention hearings.",
    text: `RULE 107: SUBPOENAS

(a) Form - Issuance. Every subpoena shall be issued by the clerk. Each subpoena shall state the name of the court and the title of the action. Each subpoena shall command the person to attend and give testimony at a hearing and shall specify the time and place and the name of the party for whom testimony will be given. The clerk shall issue a subpoena or a subpoena for the production of documentary evidence, signed but otherwise in blank, to a party requesting it, who shall fill it in before service.

(b) Subpoena of Persons. With the exception of emergency hearings, preliminary hearings, detention hearings, or for good cause shown, all subpoenas for the attendance of witnesses shall be served at least 5 calendar days prior to the hearing.

(c) Subpoena for Production of Documents and Things. With the exception of emergency hearings, preliminary hearings, and detention hearings, all subpoenas for the production of documents, images, records, data or like information shall be served at least 10 calendar days prior to the hearing, unless otherwise provided by law. Copies of the subpoena must be served pursuant to Rule 106 on all parties, and all material produced must be made available for inspection, copying, testing, or sampling by all parties, except as otherwise provided by the law.

(d) Service. A subpoena may be served by any person authorized to serve process or the witness may acknowledge service in writing on the subpoena. Service of the subpoena shall be made by delivering or offering to deliver a copy to the person to whom it is directed in accordance with this or any local rule.

[Amended by order filed January 8, 2018, effective July 1, 2018.]`,
    tags: ["subpoena", "witnesses", "documents", "production", "service"],
  },
  {
    id: "108",
    title: "Injunctive Relief",
    part: "General Provisions",
    partNum: 1,
    description: "Establishes procedures for obtaining injunctive relief including ex parte restraining orders and injunctions in juvenile proceedings.",
    summary: "Relief may be obtained through ex parte restraining orders, pendency injunctions, or dispositional injunctions. Ex parte orders expire within 15 days and require a preliminary hearing within 72 hours when interfering with parental rights. Injunctions require notice and preponderance of evidence.",
    text: `RULE 108: INJUNCTIVE RELIEF

(a) How Obtained. Relief may be obtained through: (1) An ex parte restraining order; (2) An injunction issued during the pendency of a matter; or (3) An injunction issued as part of a dispositional order. All requests must disclose whether previous applications have been refused by any court.

(b) In General. Orders must be specific in terms and shall describe in reasonable detail the act restrained or enjoined. They require judicial signature, dating with time of issuance, and court filing. Orders bind parties, their representatives, and others with actual notice.

(c) Ex Parte Restraining Order. These orders shall only restrict the doing of an act and require probable cause, finding either that a child may abscond or there is a danger of immediate harm to a child such that a delay for a hearing would be likely to result in severe or irreparable harm. Orders expire within 15 days unless extended or consented to. When interfering with parental rights, a preliminary hearing must occur within 72 hours.

(d) Injunction. Injunctions may restrict or mandate actions. Prior to issuance, the court shall afford the party to be enjoined notice, grounds therefore, and an opportunity to be heard. The standard is preponderance of evidence. Courts issue them when conduct is or may be harmful to the child.

(e) Injunctive Relief Against Non-Party. Courts may issue orders against non-parties whose conduct is harmful to the child, without conferring party status in the underlying case.`,
    tags: ["injunction", "restraining order", "ex parte", "relief", "protective"],
  },
  {
    id: "109",
    title: "Orders for the Attachment of Children",
    part: "General Provisions",
    partNum: 1,
    description: "Governs the issuance of attachment orders for children requiring immediate court protection, including requirements for probable cause and supervision violations.",
    summary: "Attachment orders require probable cause that a child needs immediate court protection due to endangerment, flight risk, or ineffectual service. Attachments for supervision violations require evidence of injury risk, inability to locate the child, or failure to appear.",
    text: `RULE 109: ORDERS FOR THE ATTACHMENT OF CHILDREN

(a) Requirements for Issuance of Orders for Attachment.

Orders for child attachment must be grounded in judicial determination of probable cause that the child requires immediate court protection because:

(1) The child's conduct, condition, or surroundings endanger their health, welfare, or others';

(2) The child may abscond or leave court jurisdiction; or

(3) Summons or subpoena service would be ineffectual or parties evade service.

Requests must include affidavit or sworn written testimony with sufficient factual support for independent probable cause determination. Hearsay requires documented credibility basis for both declarant and statements.

(b) Attachment for Supervision Violations.

Attachments for diversion, probation, or aftercare violations require:

(1) Evidence child poses significant injury likelihood to persons or property damage;

(2) Child cannot be located despite documented location efforts; or

(3) Child fails to appear for proceedings. Attorney of record must receive notice if child has representation.

(c) Failure to Appear.

Courts may issue attachments when children fail to appear at properly served hearings or court-scheduled proceedings, either sua sponte or upon sworn petition.

(d) Order Terms.

Attachment orders direct the child be brought before court or taken into custody per Rules 203 or 302.

[Amended December 21, 2016 (effective July 1, 2017) and January 8, 2019 (effective October 1, 2019)]`,
    tags: ["attachment", "custody", "probable cause", "failure to appear", "supervision"],
  },
  {
    id: "110",
    title: "Time",
    part: "General Provisions",
    partNum: 1,
    description: "Rules for computing time periods, extensions, and exceptions in juvenile court proceedings.",
    summary: "Provides methods for computing time periods prescribed by rules, court orders, or statutes. Periods under 11 days exclude intermediate Saturdays, Sundays, and holidays. Courts may extend deadlines for cause, with specific exceptions for detention hearings and appeals.",
    text: `RULE 110: TIME

(a) Computation. In computing any period of time prescribed or allowed by these rules, by order of court, or by any applicable statute, the date of the act, event or default is not to be included. The last day of the period so computed shall be included unless:

(1) it is a Saturday, a Sunday, or a legal holiday as defined in Tenn. Code Ann. Section 15-1-101, or

(2) the act to be done is the filing of a paper in court, and the last day is a day on which the office of the court clerk is closed or on which weather or other conditions have made the office of the court clerk inaccessible.

In either instance, the event period runs until the end of the next day which is not one of the aforementioned days. Absent statutory authority or a Rule of Juvenile Procedure to the contrary, when the period of time prescribed or allowed is less than 11 days, intermediate Saturdays, Sundays and legal holidays shall be excluded in the computation.

(b) Extension. For cause shown, the court may extend the period of time to perform an act if the request is made prior to the expiration of the period originally prescribed. However, upon motion made after the expiration of the specified period of time to perform an act, the court may permit the act to be done where the failure to act was the result of excusable neglect. This subdivision does not apply to the time for scheduling a detention or preliminary hearing, holding hearings regarding the violation of a valid court order, filing a notice of appeal or request for hearing before the judge from the magistrate's order.

(c) Exceptions. This rule does not apply to the time provided to:

(1) serve a summons or subpoena;

(2) make a probable cause determination pursuant to Rules 203 and 302;

(3) ratify a permanency plan pursuant to T.C.A. Section 37-2-403(a); or

(4) hold a permanency hearing pursuant to T.C.A. Sections 37-1-166(g)(5) and 37-2-409.`,
    tags: ["time", "computation", "deadlines", "extension", "holidays"],
  },
  {
    id: "111",
    title: "Scheduling Conferences and Orders",
    part: "General Provisions",
    partNum: 1,
    description: "Authorizes scheduling conferences and orders to manage case timelines, including sanctions for noncompliance.",
    summary: "Courts may conduct scheduling conferences with attorneys and unrepresented parties to establish timeframes for joining parties, amending pleadings, filing motions, completing discovery, and setting adjudication dates. Sanctions including attorney's fees may be imposed for noncompliance.",
    text: `RULE 111: SCHEDULING CONFERENCES AND ORDERS

(a) Conference. The court may conduct a conference with party attorneys and unrepresented parties in person, by telephone, or other suitable means to establish a scheduling order limiting timeframes for joining parties, amending pleadings, filing motions, completing discovery, and setting adjudication dates.

(b) Scheduling Order. Following any conference under this rule, the court must enter an order documenting actions taken. This order governs the case's subsequent proceedings unless later modified.

(c) Sanctions. The court may penalize parties or attorneys for: failing to comply with scheduling orders; failing to appear at conferences; being substantially unprepared; or failing to participate in good faith. Sanctions may include reasonable expenses and attorney's fees, unless the court determines noncompliance was substantially justified or other circumstances render an award unjust.

Advisory Commission Comments:

The 2016 amendments introduced this rule to reduce unnecessary delays, drawing from Tennessee Rules of Civil Procedure Rule 16. Courts may enter scheduling orders without holding conferences and may consider doing so during preliminary hearings in dependency and neglect proceedings, including dates for child and family team meetings and various hearings.`,
    tags: ["scheduling", "conferences", "orders", "sanctions", "case management"],
  },
  {
    id: "112",
    title: "Attendance of Parties and Other Necessary Persons",
    part: "General Provisions",
    partNum: 1,
    description: "Requirements for ensuring all necessary persons attend hearings, including provisions for remote participation.",
    summary: "Courts must verify all necessary persons are present at each hearing, including children, parents, and guardians. Remote audio-visual participation is permitted for good cause, but in delinquent or unruly adjudicatory hearings, remote witness testimony requires waiver of the right to confrontation.",
    text: `RULE 112: ATTENDANCE OF PARTIES AND OTHER NECESSARY PERSONS

(a) Initial Inquiry by Court. At the beginning of each hearing, the court shall ascertain whether all necessary persons are before the court, which may include the child, parents (including alleged biological fathers), guardian or other custodian, and other parties and participants to the proceeding. If a necessary person is not present, the court shall determine whether notice of the hearing was provided to that person and whether the hearing may proceed.

(b) Responsibility of Department when Party to Proceeding. If a parent's identity or whereabouts are unknown and the Department of Children's Services is a party to the proceedings, the court shall ascertain whether the Department has made reasonable efforts to determine the identity and the whereabouts of the absent parent and include such finding in its order.

(c) Participation by Contemporaneous Means. In any proceeding, for good cause shown in compelling circumstances and with appropriate safeguards, the court may permit participation in open court by contemporaneous audio-visual transmission from a different location. However, during a delinquent or unruly adjudicatory hearing, a witness may only testify from a different location if the child has waived the right to confrontation.

[Amended in its entirety by Order filed December 29, 2015; effective July 1, 2016]`,
    tags: ["attendance", "parties", "remote participation", "confrontation", "hearing"],
  },
  {
    id: "113",
    title: "[Reserved]",
    part: "General Provisions",
    partNum: 1,
    description: "This rule is reserved for future use.",
    summary: "Rule 113 is reserved for future use and contains no substantive provisions.",
    text: `RULE 113: [RESERVED]

This rule is reserved for future use.`,
    tags: ["reserved"],
  },
  {
    id: "114",
    title: "Confidentiality of Proceedings",
    part: "General Provisions",
    partNum: 1,
    description: "Governs public access to juvenile proceedings, distinguishing between dependent/neglect cases (closed) and delinquent/unruly cases (open with closure provisions).",
    summary: "Dependent and neglect cases are not open to the public. Delinquent and unruly cases are open but may be closed if the requesting party proves particularized prejudice overriding public interest. Closure orders must be narrowly tailored with written findings.",
    text: `RULE 114: CONFIDENTIALITY OF PROCEEDINGS

(a) Dependent and Neglect Proceedings. Dependent and neglect cases shall not be open to the public.

(b) Delinquent and Unruly Proceedings. Delinquent and unruly cases are open to the public. However, courts may exclude the general public from proceedings. On party application or court initiative, proceedings may be closed except to those with direct case interest. When evaluating closure, courts must apply these standards:

(1) When closure is sought by a party:

(A) The party seeking to close the hearing shall have the burden of proof.

(B) Courts cannot close proceedings unless closure prevents particularized prejudice that overrides public interest in open proceedings.

(C) Any order of closure must not be broader than necessary to protect the determined interests.

(2) Courts must consider reasonable alternatives to closure.

(3) Courts must make adequate written findings supporting closure orders.

Advisory Commission Comments:

Dependent and neglect cases should remain closed to the public, limited to necessary participants. The rule references State v. James, 902 S.W.2d 911 (Tenn. 1995), authorizing this closure process for delinquent and unruly cases.`,
    tags: ["confidentiality", "public access", "closure", "privacy", "open proceedings"],
  },
  {
    id: "115",
    title: "Recording Hearings",
    part: "General Provisions",
    partNum: 1,
    description: "Requires audio recording of all juvenile court hearings except ex parte hearings, with minimum one-year retention.",
    summary: "All hearings except ex parte hearings must be audio recorded by the clerk and retained for at least one year from the date of final disposition. Alternative recording methods including audio-visual equipment are permitted. Foster care review board proceedings are excluded.",
    text: `RULE 115: RECORDING HEARINGS

All hearings, except ex parte hearings, shall be audio recorded by the clerk of the court and retained for a minimum of one year from the date of the final disposition of the case.

Advisory Commission Comments:

The rule establishes that juvenile courts function as courts of record under Tennessee Code Annotated Sections 37-1-124(c) and 37-1-159(a). Courts must create and maintain audio recordings of all juvenile court hearings alongside appropriate hearing minutes. The rule permits alternative recording methods, including audio-visual equipment, and does not restrict simultaneous recording by court reporters or other parties.

The rule explicitly excludes foster care review board proceedings from its requirements.`,
    tags: ["recording", "audio", "court record", "retention", "hearings"],
  },
  {
    id: "116",
    title: "Standard of Proof",
    part: "General Provisions",
    partNum: 1,
    description: "Establishes preponderance of the evidence as the default standard of proof when not otherwise designated.",
    summary: "When no statute or rule expressly designates a standard of proof for a juvenile court hearing, the default standard is preponderance of the evidence. This applies to proceedings such as competency hearings or pretrial diversion approval hearings.",
    text: `RULE 116: STANDARD OF PROOF

In any hearing in which the standard of proof is not expressly designated by statute or rule, the standard of proof shall be preponderance of the evidence.

Advisory Commission Comments:

While most juvenile court hearings have designated standards, some do not -- such as competency hearings or hearings regarding pretrial diversion approval. In these cases, the preponderance of the evidence standard applies as the default threshold.`,
    tags: ["standard of proof", "preponderance", "evidence", "burden of proof"],
  },
  {
    id: "117",
    title: "Entry of Order",
    part: "General Provisions",
    partNum: 1,
    description: "Defines when court orders become effective and establishes clerk duties for order entry and distribution.",
    summary: "An order becomes effective when marked as filed by the clerk, bearing the judge's or magistrate's signature plus either all parties' signatures, one party's signature with service certificate, or a clerk's service certificate. The clerk must make docket notations and distribute copies upon request.",
    text: `RULE 117: ENTRY OF ORDER

(a) Effective. Entry of a court order is effective when an order containing one of the following is marked on the face by the clerk as filed for entry:

(1) the signatures of the judge or magistrate and all parties or counsel, or

(2) the signatures of the judge or magistrate and one party or counsel with a certificate of counsel that a copy of the proposed order has been served on all other parties or counsel, or

(3) the signature of the judge or magistrate and a certificate of the clerk that a copy has been served on all other parties or counsel.

(b) Duties of Clerk. Following the entry of order, the clerk shall make appropriate docket notations and shall copy the order on the minutes, but failure to do so will not affect the validity of entry of the order. When requested by counsel or self-represented parties, the clerk shall without delay mail or deliver a copy of the entered order to all parties or counsel. If the clerk fails to do so, a party prejudiced by that failure may seek relief under Rule 213 in delinquent or unruly cases and Rule 310 in dependent and neglect cases.

[Amended December 29, 2015; Effective July 1, 2016]`,
    tags: ["orders", "entry", "effective date", "clerk", "signatures"],
  },
  {
    id: "118",
    title: "Appeals",
    part: "General Provisions",
    partNum: 1,
    description: "Establishes appeal procedures from juvenile court, including right to counsel, filing deadlines, perfection requirements, and de novo review.",
    summary: "Appeals follow T.C.A. Section 37-1-159. Notice of appeal must be filed within 10 days of final order entry. An appeal is perfected upon filing plus payment of fees, posting bond, or approval of indigency affidavit. The circuit court conducts a de novo hearing on the complete case record.",
    text: `RULE 118: APPEALS

(a) General. Appeals follow Tennessee Code Annotated Section 37-1-159.

(b) Right to Attorney. Parties retain counsel access throughout proceedings, including appeals.

(c) When Right Attaches. The appeal right arises upon entry of the final order.

(d) Notification. Judges must inform all parties of appeal rights, time limits, procedures, and counsel availability at hearings resulting in final orders.

(e) Filing. Notices of appeal must be filed within 10 days of the final order's entry with the juvenile court clerk. Premature filings are treated as filed on the order entry date.

(f) Perfection. An appeal becomes perfected upon filing a notice plus either: (1) payment of filing fees or posting bond; (2) filing an indigency affidavit with subsequent court approval; or (3) prior court determination of indigent status.

(g) Indigent Status. Denials of indigent filing status must be served to parties.

(h) Record on Appeal. Upon perfection, the clerk transfers the complete case record to circuit court for a de novo hearing.

(i) Parties to Appeal. All juvenile court proceeding parties participate in the de novo hearing.

Advisory Commission Comments:

Final orders include dispositional rulings, probation revocations, and home placement terminations, among others.`,
    tags: ["appeal", "de novo", "filing deadline", "perfection", "indigent", "circuit court"],
  },
  {
    id: "201",
    title: "Preliminary Inquiry and Informal Adjustment",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Governs the preliminary inquiry process and informal adjustment procedures for delinquent and unruly complaints.",
    summary: "Establishes the process for receiving and screening complaints alleging delinquency or unruliness. Officers may resolve matters through informal adjustment (up to 3 months, extendable to 6) without requiring admission. Statements made during inquiry or adjustment are inadmissible prior to dispositional hearing.",
    text: `RULE 201: PRELIMINARY INQUIRY AND INFORMAL ADJUSTMENT

(a) Purposes. The juvenile court preliminary inquiry aims to:

(1) Resolve complaints by excluding matters where: the court lacks jurisdiction; insufficient evidence exists; or the matter is not serious enough for official action or should be referred elsewhere;

(2) Commence proceedings only when necessary for child welfare or public safety.

(b) Receipt of Complaint. Any person or agency may file a complaint with the juvenile court alleging a child is delinquent or unruly. The receiving officer must note the date and time.

(c) Duties of Designated Court Officer. Upon receipt, the officer shall:

(1) Interview the complainant, victim, and witnesses;

(2) Interview the child and parents or guardians, explaining the complaint, right to counsel, appointment eligibility, and rights regarding statements;

(3) Close the complaint if jurisdiction is lacking or evidence is insufficient.

(d) Informal Adjustment.

(1) If the matter is not serious enough for formal proceedings, the officer may provide counsel through informal adjustment without requiring admission. Considerations include child's home, school, and community problems, parental cooperation, assessments, attitude, prior history, victim concerns, and the child's age and maturity.

(2) Adjustment requires consent from the child and parents, with notification that participation is optional and terminable.

(3) The process cannot exceed 3 months (extendable to 6 months by court approval) and cannot impose financial obligations or restitution.

(4) Successful completion closes the complaint; if a petition was filed, it is dismissed with prejudice.

(5) The officer may terminate if the child or parents decline participation, deny jurisdiction, request court determination, or fail to comply.

(6) Termination requires notice to the child, parents, and victim, including the termination basis.

(e) Informal Adjustment Deemed Inappropriate. If inappropriate, formal proceedings commence via petition or citation filing.

(f) Statements of Child. Statements made during preliminary inquiry or informal adjustment are inadmissible in the subject delinquent or unruly proceeding prior to the dispositional hearing.`,
    tags: ["preliminary inquiry", "informal adjustment", "complaint", "screening", "diversion"],
  },
  {
    id: "202",
    title: "Pretrial Diversion",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Establishes pretrial diversion agreements as an alternative to formal adjudication for delinquent and unruly children.",
    summary: "Written pretrial diversion agreements may be established between the child, parent/guardian, and court officer without requiring an admission. The process lasts up to 6 months (extendable to 12) and requires court approval. Statements made during diversion are inadmissible prior to dispositional hearing.",
    text: `RULE 202: PRETRIAL DIVERSION

(a) Pretrial Diversion Agreement. A written, signed agreement may be established when the designated court officer determines appropriateness. Participants include the child, parent or guardian, and court officer. No admission of the allegation contained in the petition shall be required. The agreement requires court approval before effectiveness.

(b) Consent. The process requires consent from both the child and their parent, guardian, or legal custodian.

(c) Time Limits. The diversion process continues up to 6 months unless earlier discharge occurs. Extensions up to an additional 6 months are possible following application, notice, and hearing.

(d) Modification. With mutual consent and court approval, agreement requirements may be modified before termination.

(e) Violation of Pretrial Diversion. Written notice of alleged violations must be provided with an opportunity for the child to respond before reinstating original proceedings. Notice filing extends the diversion period pending prompt hearing.

(f) Statements of Child. Statements made during preliminary inquiry or pretrial diversion are inadmissible in the delinquent or unruly subject proceeding prior to the dispositional hearing.

[Amended effective July 1, 2017 and October 1, 2019.]`,
    tags: ["diversion", "pretrial", "alternative", "agreement", "rehabilitation"],
  },
  {
    id: "203",
    title: "Procedures Upon Taking a Delinquent Child Into Custody",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Establishes procedures when a delinquent child is taken into custody, including detention requirements, timing for hearings, and rights notification.",
    summary: "Children not detainable must be released to parents within a reasonable time. If held without prior court order, a magistrate must make a probable cause determination within 48 hours and a detention hearing must occur within 72 hours. Children must be informed of their rights including right to counsel and Miranda-type protections.",
    text: `RULE 203: PROCEDURES UPON TAKING A DELINQUENT CHILD INTO CUSTODY

(a) Release Without Detention. When a child is taken into custody but is not detainable, the child must be released to the child's parent, guardian or other custodian within a reasonable time. A summons is then served requiring the child's court appearance.

(b) Detention Without Release. If a child alleged to be delinquent is held in secure detention without a prior court order, a magistrate must make a probable cause determination within 48 hours (or 24 hours excluding nonjudicial days for special circumstances cases). If the magistrate fails to make required findings, the child is immediately released. If held, a detention hearing must occur within 72 hours (excluding nonjudicial days), not exceeding 84 hours total.

(c) Secure Detention Requirements. The child must be placed in a juvenile detention facility, and both court and custodians must be notified immediately. The facility must inform the child verbally and in writing of: the detention reason, right to a detention hearing, right to counsel with appointed attorney if needed, Miranda-type rights regarding statements, and rights to communicate with counsel and family.

(d) Detention Hearing. The court must inform parties of hearing purpose and determine: probable cause for the offense; whether the offense qualifies for detention; whether detention serves the child's and community's best interests; and whether less restrictive alternatives exist.`,
    tags: ["custody", "detention", "probable cause", "miranda", "release", "delinquent"],
  },
  {
    id: "204",
    title: "Use of Restraints on Children in the Courtroom",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Limits the use of physical restraints on children in juvenile court to situations involving safety threats or flight risk.",
    summary: "Restraints are permitted only when a child poses a safety threat or substantial flight risk with no less restrictive alternatives available. Restraint decisions must be individually determined with findings on the record, and are particularly inappropriate for children who have experienced abuse, neglect, or have disabilities.",
    text: `RULE 204: USE OF RESTRAINTS ON CHILDREN IN THE COURTROOM

(a) Restraints on children in juvenile court are permitted when the judge determines that:

(1) The behavior of the child represents a threat to his or her safety or the safety of other people in the courtroom; or

(2) The behavior of the child presents a substantial risk of flight from the courtroom; and

(3) There are no less restrictive alternatives to restraints that will prevent flight or risk of harm.

(b) Any party may request a hearing on restraint necessity, and judges must make findings on the record explaining their restraint decisions.

Advisory Commission Comments:

The Commission emphasizes that restraints should be individually determined based on specific factors, including: charge severity, delinquency history, past disruptive conduct, escape attempts, and courtroom security conditions.

The guidance specifically notes that restraints on these children are particularly inappropriate in most circumstances when children have experienced abuse or neglect or have disabilities. Additionally, restraints impair attorney-client communication, as juveniles have limited understanding of the criminal justice system and the roles of the institutional actors within it.`,
    tags: ["restraints", "courtroom", "safety", "flight risk", "disabilities"],
  },
  {
    id: "205",
    title: "Notification and Waiver of Rights of Children",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Comprehensive rules for notifying children of their rights and procedures for valid waivers in delinquent and unruly proceedings.",
    summary: "Courts must inform children of their right to an attorney, and waivers require knowing and voluntary written confirmation. Unrepresented children cannot waive rights unless they consult with a knowledgeable adult with no adverse interest. All waivers must occur orally in open court and be confirmed in writing.",
    text: `RULE 205: NOTIFICATION AND WAIVER OF RIGHTS OF CHILDREN

(a) Right To Attorney.

(1) Notification of Right to Attorney. Courts must expressly inform children entitled to legal representation of this right. If a child waives representation, the court shall advise of the continuing right to an attorney at all stages of the proceedings.

(2) Waiver of Right to an Attorney. A child's waiver is only valid when:
- The child has been fully informed of attorney rights
- The child knowingly and voluntarily waives the right
- The waiver is confirmed in writing by the child

(3) Appointment of Attorney. Courts must appoint an attorney for entitled children who cannot afford one or whose parents refuse to hire one, with fees assessed per T.C.A. Section 37-1-150.

(b) Notification And Waiver of Additional Rights at a Hearing.

(1) Rights Advisement. Courts must inform unrepresented children of rights including: remaining silent, pleading not guilty, obtaining a trial, confronting witnesses, presenting testimony, subpoenaing evidence, and appealing with information on the time limits for and manner in which the right to appeal can be perfected.

(2) Represented Children. Attorneys must fully advise represented children of constitutional and statutory rights, though courts retain obligations to advise and confirm knowing waivers.

(3) Unrepresented Children. Unrepresented children cannot waive rights unless courts fully advise them and determine the waiver is knowing and voluntary after the child has consulted with a knowledgeable adult who has no interest adverse to the child.

(c) Knowing and Voluntary Waivers.

(1) Criteria. Courts accept waivers only if children can make intelligent decisions based on mental condition, age, education, experience, case complexity, or other relevant factors.

(2) Procedure. All waivers must occur orally in open court and be confirmed in writing by both child and judge, with courts confirming attorney right waivers before proceeding.`,
    tags: ["rights", "waiver", "attorney", "notification", "self-incrimination", "counsel"],
  },
  {
    id: "206",
    title: "Discovery",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Ensures parties in delinquent and unruly proceedings have access to discovery materials consistent with criminal procedure rules.",
    summary: "Juvenile courts must ensure discovery access consistent with Rule 16 of the Rules of Criminal Procedure. Informal discovery requests are encouraged, but formal requests may be made when agreement fails. The state must disclose exculpatory evidence per Brady v. Maryland.",
    text: `RULE 206: DISCOVERY

(a) Each juvenile court shall ensure that the parties in delinquent and unruly proceedings have access to any discovery materials consistent with Rule 16 of the Rules of Criminal Procedure.

(b) An informal request for discovery is encouraged, but if the parties cannot agree as to discovery, then a formal discovery request shall be made.

Advisory Commission Comments:

The Commission acknowledged concerns about potential burdens and delays from applying criminal discovery methods directly to juvenile court proceedings. Courts may adopt local rules implementing Tennessee's criminal discovery mechanisms, provided they remain consistent with the Rules of Juvenile Procedure.

Key points include:
- Discovery rules do not apply to preliminary examinations or probable cause hearings, citing State v. Willoughby.
- The state must disclose exculpatory evidence per Brady v. Maryland.
- When parties cannot agree on discovery, the Tennessee Rules of Criminal Procedure shall be utilized to ensure that each side has access to discovery materials in each case.
- Practitioners should familiarize themselves with Rule 16 of the Rules of Criminal Procedure.`,
    tags: ["discovery", "evidence", "brady", "criminal procedure", "disclosure"],
  },
  {
    id: "207",
    title: "Procedures Related to Child's Mental Condition",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Establishes procedures for evaluating a child's mental competency to stand trial and mental state defenses in delinquent and unruly proceedings.",
    summary: "If reasonable grounds exist to believe a child is incompetent, proceedings are stayed pending evaluation by a licensed psychologist or psychiatrist with child development expertise. Statements made during competency examinations are inadmissible. Mental state defenses require pretrial notice to the court.",
    text: `RULE 207: PROCEDURES RELATED TO CHILD'S MENTAL CONDITION

(a) At Time of Adjudicatory Hearing.

(1) If at any time prior to or during the adjudicatory hearing in a delinquent or unruly case, the court has reasonable grounds to believe the child named in the petition may be incompetent to proceed with an adjudicatory hearing, the court shall stay the proceedings pending a determination of the child's competency to stand trial. Reasonable grounds to believe that the child is incompetent to proceed may be based upon an oral or written motion by any party or upon the court's own initiative.

(2) The court shall order one or more evaluations of a child to assist in determining whether the child is mentally competent to stand trial. The evaluations are to be performed by a licensed psychologist or psychiatrist who has expertise in child development and has received training in forensic evaluation procedures through formal instruction, professional supervision, or both.

(3) If the issue of a child's competency to stand trial arises prior to the child having either a retained or appointed attorney, no further action will occur until an attorney is in place to represent the child.

(4) In any case in which such an evaluation is ordered, the court shall schedule a hearing in order to determine competency.

(5) If the child is found to be incompetent to proceed with the adjudicatory hearing, the adjudication shall be stayed pending further proceedings and time limits shall be tolled. If the court finds that the provision of services or treatment to the child may result in the child achieving competence, then the court may order such treatment or services. In addition, the court may inform the parties as to procedures for voluntary admission to public and private mental health facilities in lieu of judicial commitment. If the child does not meet the standards for involuntary hospitalization, but remains incompetent to stand trial, the child shall be released to the appropriate guardian or custodian pending further hearings in juvenile court.

(6) If the child is found to be competent the court shall proceed with an adjudicatory hearing.

(7) The child's mental competence to stand trial may be raised at any stage of the proceeding by motion, and the court has a continuing obligation to consider the issue when raised.

(b) At Time of the Offense; Affirmative Defense.

(1) If the child named in the petition intends to introduce expert testimony relating to a mental disease, defect, or other condition bearing upon the issue of whether the child had the mental state required for the offense charged, the child shall, within the time provided for the filing of pretrial motions or at such later time as the court may direct, notify the court in writing of such intention and file a copy of such notice with the clerk. Upon filing of the notice, upon motion of the state, or on its own initiative, the court may cause the child to be examined in accordance with the procedures set forth in this rule and consistent with the procedures outlined in Rule 12.2 of the Rules of Criminal Procedure.

(2) The court, upon good cause shown and in its discretion, may waive the requirements in subdivision (b)(1) and permit the introduction of such defense, or may continue the hearing for the purpose of an examination in accordance with the procedures set forth in this rule. A continuance granted for this purpose tolls the time limits for adjudicatory hearings.

(c) Inadmissibility of Child's Statements During Competency Examination.

No statement made by the child in the course of any examination relating to his or her competency to stand trial (whether conducted with or without the child's consent), no testimony by any expert based on such statement, and no other fruits of the statement are admissible in evidence against the child in a delinquent or unruly adjudicatory hearing.`,
    tags: ["competency", "mental health", "evaluation", "insanity defense", "incompetent"],
  },
  {
    id: "208",
    title: "Transfer to Criminal Court",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Procedures for transferring jurisdiction of a child from juvenile court to criminal court.",
    summary: "The state must file written notice of intent to seek transfer within 90 days of charging and at least 14 days before the transfer hearing. At the hearing, both sides must be represented by counsel, the child may testify and call witnesses, and transfer requires satisfaction of statutory criteria plus probable cause.",
    text: `RULE 208: TRANSFER TO CRIMINAL COURT

(a) Notice of Intent to Seek Transfer of Jurisdiction of Child to Criminal Court.

The state must file written notice in good faith of intent to seek transfer per Tenn. Code Ann. Section 37-1-134. The decision must be made within 90 days of the child being charged and no less than 14 days prior to the transfer hearing or adjudicatory hearing, whichever occurs first. This timeframe may be extended by court for good cause. Once notice is filed, the court shall not hear the case on its merits but shall proceed only in accordance with Section 37-1-134.

(b) Transfer Hearing.

(1) At the transfer hearing:

- A prosecutor shall represent the state
- The child shall be represented by an attorney
- The child may testify and call witnesses, but no plea shall be accepted
- All witnesses shall testify under oath and be subject to cross-examination

(2) The same rules of evidence applicable to preliminary examinations under Tennessee Rules of Criminal Procedure shall apply.

(3) Unless the child appears mentally ill or intellectually disabled and asserts this claim, it shall be presumed the child is not committable. Courts shall order psychological or psychiatric examination if mental illness is alleged.

(4) If transfer criteria are satisfied and probable cause exists, the child may be transferred to criminal court.

(5) Any transfer order shall specify grounds and set bond if the offense is bailable.`,
    tags: ["transfer", "criminal court", "waiver", "jurisdiction", "prosecution"],
  },
  {
    id: "209",
    title: "Plea of Guilty or No Contest -- Judicial Diversion",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Requirements for accepting guilty and no contest pleas, including judicial inquiry, voluntariness determinations, and judicial diversion provisions.",
    summary: "Before accepting a guilty or no contest plea, courts must inform children of charge consequences, trial rights, self-incrimination protections, and immigration consequences. Pleas must be voluntary with a factual basis. Under judicial diversion, a plea is not entered as a guilty judgment and the child is not found delinquent unless probation is violated.",
    text: `RULE 209: PLEA OF GUILTY OR NO CONTEST -- JUDICIAL DIVERSION

(a) Court's Inquiry of Child. Before accepting a guilty or no contest plea, courts must inform children of: the charge nature and dispositional consequences; right to attorney representation; right to plead not guilty; right to trial with appropriate burden of proof (beyond reasonable doubt for delinquency, clear and convincing evidence for unruly charges); trial rights including witness presentation and confrontation; right against self-incrimination; that pleading guilty waives trial rights; admission of need for treatment; waiver of appeal rights for adjudication and disposition; potential questioning by court under oath; and immigration status consequences.

(b) Voluntariness Determination. The court shall not accept a guilty or no contest plea without first, by addressing the child personally in open court, determining that the plea is voluntary and not the result of force or threats or promises apart from a plea bargain agreement.

(c) Factual Basis. Courts must establish factual basis for guilty pleas before judgment entry or disposition approval.

(d) No Contest Pleas. No contest pleas require court consent, with consideration of party views and justice administration interests.

(e) Disposition Agreements. Courts must approve agreed dispositions when accepting pleas; rejected pleas void dispositional agreements.

(f) Judicial Diversion. When pleas are accepted under judicial diversion with approved probation conditions, the plea shall not be entered as a judgment of guilty and the child shall not be found delinquent. Plea converts to guilty judgment upon violation findings.`,
    tags: ["guilty plea", "no contest", "judicial diversion", "voluntariness", "plea bargain"],
  },
  {
    id: "210",
    title: "Adjudicatory Hearings",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Procedures and standards for adjudicatory hearings in delinquent and unruly cases, including timing requirements and evidence standards.",
    summary: "Adjudicatory hearings determine whether a child is delinquent or unruly. Detained children must be heard within 30 days of placement; all cases within 90 days maximum. Delinquency requires proof beyond reasonable doubt; unruly conduct requires clear and convincing evidence. Only formally admitted evidence under Tennessee Rules of Evidence is considered.",
    text: `RULE 210: ADJUDICATORY HEARINGS

Scope. The adjudicatory hearing determines whether evidence supports findings that a child is delinquent or unruly and needs treatment or rehabilitation.

Timing Requirements. Cases involving detained children must be heard within 30 days of placement outside the home. All other cases should be heard within 30 days of petition filing if reasonable, with a maximum 90-day deadline for all cases.

Hearing Procedures. Courts must verify the child's identity and relationship to parties, confirm proper notice, explain hearing purposes and consequences, and inform parties of their rights.

Evidence Standards. Only formally admitted evidence may be considered under Tennessee Rules of Evidence. The court shall consider only evidence which has been formally admitted at the adjudicatory hearing. All testimony shall be under oath and may be in narrative form.

Delinquency Adjudication. Requires proof beyond a reasonable doubt. A finding of guilt triggers a separate hearing on whether treatment is needed; adjudication occurs only if the court finds treatment necessary.

Unruly Adjudication. Requires proof by clear and convincing evidence, followed by the same two-step process as delinquency cases.

[Amended December 2016, effective July 1, 2017]`,
    tags: ["adjudicatory hearing", "evidence", "beyond reasonable doubt", "clear and convincing", "trial"],
  },
  {
    id: "211",
    title: "Dispositional Hearings",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Governs dispositional hearings in delinquent and unruly cases, including timing, evidence standards, and temporary orders.",
    summary: "Dispositional hearings must occur within 15 days of adjudication if the child is detained, or 90 days otherwise. The hearing is separate from the adjudicatory hearing. Reliable hearsay including psychological evaluations and probation reports is admissible, and the standard of proof is preponderance of the evidence.",
    text: `RULE 211: DISPOSITIONAL HEARINGS

(a) Time Limits on Scheduling Dispositional Hearings. Dispositional hearings must occur within 15 days of the adjudicatory hearing if the child is in detention, or within 90 days for all other cases. Continuances are permitted upon good cause.

(b) Separate from Adjudicatory Hearing. The dispositional hearing is separate and distinct from the adjudicatory hearing though it may follow immediately or occur later.

(c) Notice of Right to Appeal. The court must inform the child of appellate rights at the conclusion of the dispositional hearing.

(d) Temporary Order. During continuances, courts may issue temporary orders serving the child's best interest, including detention when necessary for protection or ensuring appearance.

(e) Evidence Admissible; Standard of Proof. The court considers only formally admitted evidence and juvenile court records. All testimony shall be under oath and may be in narrative form. Reliable hearsay, including psychological evaluations and probation reports, is admissible with opportunity for rebuttal. The standard of proof is preponderance of the evidence.

[Amended December 21, 2016, effective July 1, 2017.]`,
    tags: ["disposition", "sentencing", "hearsay", "temporary order", "probation report"],
  },
  {
    id: "212",
    title: "Probation or Home Placement Supervision Violation",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Procedures for establishing violations of probation or home placement supervision conditions.",
    summary: "Proceedings for probation or supervision violations follow the same procedures as delinquent conduct petitions. The standard of proof is preponderance of the evidence. If a violation is found, the court may impose any disposition that would have been permissible in the original proceeding.",
    text: `RULE 212: PROBATION OR HOME PLACEMENT SUPERVISION VIOLATION

(a) Procedure. Proceedings to establish a violation of the conditions of probation or home placement supervision shall be conducted in the same manner as proceedings on petitions alleging delinquent conduct. A child facing such proceedings receives the same protections as those alleged to be delinquent. A petition is mandatory for probation violations and for home placement supervision violations when the child has been released from Department of Children's Services custody. The petition must identify the sought remedy and factual basis.

(b) Burden of Proof. The standard is a preponderance of the evidence.

(c) Disposition. If a violation is found, the court may make any other disposition which would have been permissible in the original proceeding, subject to applicable Tennessee Code Annotated provisions.

Advisory Commission Comments:

The rule distinguishes between probation (state or county) and home placement supervision (aftercare for children previously in state custody). Petitions are required when children not in state custody violate aftercare conditions, and hearings must occur within seven days if detention is involved.

[Amended by order filed January 8, 2019, effective October 1, 2019.]`,
    tags: ["probation", "violation", "supervision", "aftercare", "revocation"],
  },
  {
    id: "213",
    title: "Modification of or Relief from Judgments or Orders",
    part: "Delinquent and Unruly Children",
    partNum: 2,
    description: "Procedures for modifying or obtaining relief from judgments and orders in delinquent and unruly cases.",
    summary: "Courts may correct clerical errors at any time and modify orders for changed circumstances or newly discovered evidence in the child's best interest. Orders may be set aside for fraud, lack of jurisdiction, or newly discovered evidence. Any party, probation officer, or interested person may seek relief by motion.",
    text: `RULE 213: MODIFICATION OF OR RELIEF FROM JUDGMENTS OR ORDERS

(a) Except in cases where the petition has been heard upon the merits and dismissed, the procedures herein shall be followed to obtain appropriate relief under this rule.

(b) Modification of Orders.

(1) Clerical Mistakes. Clerical mistakes and errors arising from oversight or omission in orders or other parts of the record may be corrected by the court at any time on its own initiative or on motion of any party.

(2) Modification for Changed Circumstances. An order may be modified if circumstances have changed since entry and the child's best interests require it; however, orders committing delinquent or unruly children to the Department of Children's Services or dismissal orders cannot be modified on these grounds.

(3) Modification for Newly Discovered Evidence. A dispositional order may be modified based on newly discovered evidence consistent with the child's best interests.

(c) Relief from Judgments or Orders.

An order shall be set aside if determined that:

(1) It was obtained by fraud or mistake meeting legal requirements applicable to civil actions;

(2) The court lacked jurisdiction over necessary parties or subject matter; or

(3) Newly discovered evidence requires it, provided the movant was without fault in failing to present such evidence originally and it might have resulted in a different judgment.

(d) Procedure. Any party, probation officer, or interested person may seek relief through a motion stating concise grounds. Notice of hearing must be given to affected parties.

(e) Disposition. The court shall deny or grant relief based on evidence, and may order permissible dispositions or schedule a new dispositional hearing.`,
    tags: ["modification", "relief", "clerical error", "changed circumstances", "newly discovered evidence"],
  },
  {
    id: "301",
    title: "Initiation of Cases",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Establishes how dependent and neglect cases are commenced and the role of the Department of Children's Services.",
    summary: "Dependent and neglect cases begin by filing a petition. When the petitioner is not DCS, the court refers the case to DCS for investigation. Cases may be initiated by DCS, private parties, or the court itself, and subsequent petitions alleging material change are treated as continuations of the original case.",
    text: `RULE 301: INITIATION OF CASES

A dependent and neglect case is commenced by filing a petition. When the petitioner is not the Department of Children's Services, the court shall promptly refer the case to the Department for investigation.

Advisory Commission Comments:

This rule establishes how dependent and neglect cases begin in juvenile court. The previous informal adjustment practice has been discontinued.

Cases may be initiated by the Department of Children's Services, a private party, or the court itself. The clerk cannot prevent someone from filing a petition under applicable law.

When intake court officers receive allegations suggesting a child is dependent and neglected, they must assist in petition filing and refer matters to the Department. Private parties may file petitions regardless of officer assistance, and officers can make referrals even if no petition is filed.

Courts may exercise emergency authority to protect children already under jurisdiction on other petition types through bench orders. In such situations, a dependent and neglect petition must be filed within 48 hours, excluding non-judicial days, per T.C.A. Section 37-1-117.

Subsequent petitions alleging material change of circumstances following case disposition shall be treated as continuations of the original case, unless new allegations arise.`,
    tags: ["initiation", "petition", "dcs", "dependent", "neglect", "investigation"],
  },
  {
    id: "302",
    title: "Procedures Upon Taking Child Into Custody",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Detailed procedures when a child is taken into custody in dependent and neglect cases, including protective custody orders and preliminary hearings.",
    summary: "When a child is taken into custody without a court order, a protective custody order with probable cause must issue within 48 hours, and a preliminary hearing within 72 hours. The court must determine probable cause, immediate threats, and less drastic alternatives. Time limits may be waived by voluntary written waiver.",
    text: `RULE 302: PROCEDURES UPON TAKING CHILD INTO CUSTODY

(a) Child Taken Into Custody Without Court Order.

When a child is taken into custody without a court order pursuant to T.C.A. Section 37-1-113(a)(3), a written protective custody order for the removal of legal custody, containing the probable cause determination required by T.C.A. Section 37-1-114(a)(2), shall issue from a magistrate within 48 hours of the taking of physical custody. The probable cause determination shall be based on a written affidavit, which may be sworn to in person or by audio-visual electronic means. If the court denies the protective custody order, the child shall be returned to the parent, guardian, or legal custodian. If the protective custody order is issued, a preliminary hearing shall be held within 72 hours, excluding non-judicial days, of the child being taken into custody.

(b) Child Taken Into Custody Pursuant to Court Order.

If a child is removed from the home of a parent, guardian or legal custodian pursuant to a protective custody order, the child shall not remain in protective custody longer than 72 hours, excluding non-judicial days, unless a preliminary hearing is held.

(c) Findings of Protective Custody Order.

A protective custody order issued pursuant to subdivision (a) or (b) shall include findings of fact supporting the probable cause determination. In addition, if the protective custody order places the child in the custody of the Department of Children's Services, the order shall include facts supporting a finding that it is contrary to the welfare of the child to remain in the home.

(d) Preliminary Hearing.

(1) Appointment of Guardian ad Litem. The court shall make every effort to appoint a guardian ad litem for the child prior to the preliminary hearing.

(2) Notification of Rights. At the beginning of the preliminary hearing, the court shall inform the parties of the purpose of the hearing and the possible consequences of the preliminary hearing, and shall inform the parties of their rights pursuant to Rule 303.

(3) Evidence. Reliable hearsay may be considered at the preliminary hearing.

(4) Required Determinations. The court, in making a decision on whether the child's continued removal from the home is warranted, shall:

(A) Determine whether probable cause exists that the child is a dependent and neglected child; and

(B) If probable cause is found, determine whether the child is subject to an immediate threat to the child's health or safety, or whether the child may be removed from the jurisdiction of the court; and

(C) Determine whether any less drastic alternative is available to the removal of the child from the custody of the parent, guardian or legal custodian.

(5) Determination at Preliminary Hearing. If the court finds that the child's continued removal from the home is not warranted, the court shall return the child to the person from whom custody was removed. If the court determines at the hearing that the child's removal is required, the court may order that the child be placed in the custody of a suitable person, persons, or agency. If the court returns the child to the person from whom custody was removed, the court may enter a temporary order setting forth conditions of the return designed to protect the rights and interests of the child and the parties pending further hearing.

(6) Waiver of Time Limit for Preliminary Hearing. The time limit for the hearing may be waived by a knowing and voluntary written waiver by the respondent. Any such waiver may be revoked at any time, at which time a preliminary hearing shall be held within the time frame outlined in T.C.A. Section 37-1-117.`,
    tags: ["custody", "protective custody", "preliminary hearing", "probable cause", "guardian ad litem", "removal"],
  },
  {
    id: "303",
    title: "Notification and Waiver of Rights",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Rules for notifying parties of their rights and procedures for valid waivers in dependent and neglect proceedings.",
    summary: "Courts must inform parties of their right to an attorney and appoint counsel for indigent parties. Valid waivers require full notification, knowing and voluntary consent, and written confirmation. Unrepresented parties must be advised of self-incrimination, cross-examination, presentation, subpoena, and appeal rights.",
    text: `RULE 303: NOTIFICATION AND WAIVER OF RIGHTS

(a) Right to Attorney.

(1) Notification of Right to an Attorney. Courts must expressly inform parties entitled to representation of their right to an attorney. If waived, parties retain the continuing right to an attorney at all stages of the proceedings.

(2) Waiver of Right to an Attorney. A valid waiver requires: (A) full notification of attorney rights; (B) knowing and voluntary waiver; and (C) written confirmation by the party.

(3) Appointment of Attorney. Courts must appoint counsel for indigent parties who do not knowingly waive this right.

(b) Notification and Waiver of Additional Rights.

(1) Party Represented by Attorney. The attorney must advise clients of constitutional and legal rights, with the client deciding whether to waive them after consultation. Court obligations remain independent of attorney duties.

(2) Party Not Represented. Unrepresented parties cannot waive constitutional or legal rights unless the court first provides full advised notice and determines the waiver is knowing and voluntary.

(3) Notification to Unrepresented Parties. At hearings, courts must advise unrepresented parties of: privilege against self-incrimination, cross-examination rights, presentation rights, subpoena rights, and appeal rights.

(c) Knowing and Voluntary Waiver.

(1) Criteria. Courts cannot accept waivers if parties lack capacity due to mental condition, education, experience, case complexity, or other relevant factors.

(2) Procedure. All waivers must be made orally in open court and confirmed in writing by both judge and party.`,
    tags: ["rights", "waiver", "attorney", "notification", "self-incrimination", "indigent"],
  },
  {
    id: "304",
    title: "Intervention",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Rules for intervention as of right and permissive intervention in dependent and neglect proceedings.",
    summary: "Intervention as of right is allowed when conferred by constitution or statute, when an applicant's interest may be impaired without adequate existing representation, or by stipulation. Permissive intervention is available when claims share common questions of law or fact. Motions must state grounds and be served on parties.",
    text: `RULE 304: INTERVENTION

(a) Intervention as of Right. Upon timely application, anyone shall be permitted to intervene in an action: (1) when a provision of the Tennessee Constitution, the United States Constitution, or a statute confers an unconditional right to intervene; or (2) when the applicant claims an interest relating to the subject matter of the action and the applicant is so situated that the disposition of the action may, as a practical matter, impair or impede the applicant's ability to protect that interest unless the applicant's interest is adequately represented by an existing party; or (3) by written stipulation of all of the parties.

(b) Permissive Intervention. Upon timely application, anyone may be permitted to intervene in an action: (1) when a statute confers a conditional right to intervene; or (2) when an applicant's claim or defense and the main action have a question of law or fact in common. In exercising its discretion, the court shall consider whether intervention will unduly delay or prejudice the adjudication of the rights of the original parties.

(c) Procedure. Except for interventions for the purpose of modification of an order pursuant to Rule 310, anyone desiring to intervene shall serve a written motion to intervene upon the parties as provided in Rule 103. The motion shall state the grounds for the requested intervention and shall further state the claim or defense for which intervention is sought. For a person seeking to intervene as a matter of right, the motion shall state the statute or constitutional provision which gives the person the right to intervene. The court shall conduct a hearing on the motion to intervene as soon as practicable after filing of the motion.`,
    tags: ["intervention", "party", "standing", "permissive", "right to intervene"],
  },
  {
    id: "305",
    title: "Discovery",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Discovery procedures for dependent and neglect proceedings, following civil procedure rules.",
    summary: "Parties in dependent and neglect proceedings must have access to information available in circuit court. Informal discovery is preferred to avoid expense and delay. When informal attempts fail, discovery may proceed under Tennessee Rules of Civil Procedure. Guardians ad litem shall not testify at depositions.",
    text: `RULE 305: DISCOVERY

(a) Each court shall ensure that the parties in dependent and neglect proceedings have access to information which would be available in circuit court.

(b) Parties shall attempt to achieve any necessary discovery informally, in order to avoid undue expense and delay in the resolution of cases. Only when such attempts have failed, discovery may be sought and effectuated in accordance with the Tennessee Rules of Civil Procedure without a court order.

(c) Leave to obtain discovery pursuant to the Tennessee Rules of Civil Procedure for reasons other than a failed attempt at informal discovery shall be freely given by the court when justice so requires.

(d) Upon motion of a party or upon the court's own initiative, the court may order that the discovery be completed by a certain date.

(e) Any motion to compel discovery, motion to quash, motion for protective order, or other discovery related motion shall:

(1) quote verbatim the interrogatory, request, question, or subpoena at issue, or be accompanied by a copy of the interrogatory, request, subpoena, or excerpt of a deposition which shows the question and objection or response, if applicable;

(2) state the reason or reasons supporting the motion; and

(3) be accompanied by a statement certifying that the moving party or counsel has made a good faith effort to resolve by agreement the issues raised and that agreement has not been achieved.

(f) The court shall decide any motion relating to discovery in accordance with the Tennessee Rules of Civil Procedure.

(g) A child shall be required to respond to discovery requests only if the child is the petitioner or a respondent to the action.

(h) A guardian ad litem shall not testify at a deposition.

(i) Except as provided in subdivision (e) above, discovery materials shall not be filed with the court.`,
    tags: ["discovery", "civil procedure", "deposition", "guardian ad litem", "disclosure"],
  },
  {
    id: "306",
    title: "Taking Children's Testimony",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Special procedures for taking testimony from child witnesses in dependent and neglect proceedings, including accommodations and protections.",
    summary: "Child testimony must account for age and developmental level and be recorded. Examinations occur in chambers or cleared courtrooms. Courts may order accommodations including comfort animals, support persons, closed-circuit television, written questions, and exclusion of parties with safeguards for counsel presence.",
    text: `RULE 306: TAKING CHILDREN'S TESTIMONY

(a) Any examination of a child witness shall be conducted in a manner that takes into account the child's age and developmental level. Such testimony shall be recorded.

(b) When a child testifies, the examination shall be conducted either in chambers or in a courtroom which has been cleared of observers and non-party witnesses.

(c) Upon motion of any party or upon its own initiative and upon good cause shown based upon the best interest of the child, the court may order one or more of the following accommodations:

(1) Arrangement of the courtroom or chambers so that certain individuals are not within the child's line of vision;

(2) Exclusion of the parties from chambers or the courtroom while the child is testifying;

(3) Examination of the child through written questions and written answers;

(4) Observation by the parties of the child's testimony by closed circuit television or other contemporaneous audio-visual transmission;

(5) Examination of the child by the court rather than directly by the parties or attorneys;

(6) Allowing the presence of a properly trained comfort animal;

(7) Permitting the child to have a stuffed animal or similar comfort toy while testifying; or

(8) Permitting the child to be accompanied by a support person who is not a party or a witness.

(d) If the court excludes parties while the child testifies, counsel for all parties and children, including guardians ad litem, shall be present. The court shall inform unrepresented parties of their right to counsel and appoint counsel if requested by an indigent party entitled to representation.

(e) If the court examines the child rather than permitting direct party examination, the court shall ensure: (1) parties or counsel, guardians ad litem, and attorneys ad litem submit written questions prior to testimony, which the court shall ask as written; (2) objections to questions are made in writing with opportunity for response before sustaining; (3) after submitted questions are completed, the court recesses to allow attorney-client consultation and submission of additional written questions; and (4) this process continues until no further questions exist.`,
    tags: ["child testimony", "witness", "accommodations", "comfort animal", "closed circuit", "examination"],
  },
  {
    id: "307",
    title: "Adjudicatory Hearings",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Procedures and standards for adjudicatory hearings in dependent and neglect cases.",
    summary: "Adjudicatory hearings determine whether a child is dependent and neglected under T.C.A. Section 37-1-129. Cases with children placed out-of-home must be heard within 30 days; all cases within 90 days. The standard of proof is clear and convincing evidence, with written findings due within 30 days of hearing closure.",
    text: `RULE 307: ADJUDICATORY HEARINGS

(a) Scope of Hearing. The adjudicatory hearing determines whether evidence supports findings that a child is dependent and neglected, conducted per T.C.A. Section 37-1-129.

(b) Time Limits. Cases with children placed out-of-home must be heard within 30 days of placement; other cases within 30 days of petition filing if reasonable. Every case shall be heard for adjudication within 90 days of either the date the child was placed outside the home or date of filing of the petition, as applicable. Good cause permits continuations.

(c) Beginning Procedures. Courts must ascertain attorney representation, verify child identity and residence, confirm party presence, check notice compliance, explain hearing purposes and consequences, and outline party rights per Rule 303.

(d) Evidence Standards. Only formally admitted evidence is considered. All testimony shall be under oath and may be in narrative form. Evidence shall be admitted as provided by the Tennessee Rules of Evidence.

(e) Adjudication Standards. The court applies clear and convincing evidence standard, either dismissing the petition or adjudicating dependency and neglect. Written findings must be filed within 30 days of hearing closure, or within 5 days if a certiorari petition is filed.

(f) Transfer. Out-of-county cases may transfer to the child's home county for disposition.`,
    tags: ["adjudicatory hearing", "dependent", "neglect", "clear and convincing", "evidence", "findings"],
  },
  {
    id: "308",
    title: "Dispositional Hearings",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Governs dispositional hearings in dependent and neglect cases, including timing, evidence, and temporary orders.",
    summary: "Dispositional hearings must occur within 15 days if the child is placed out-of-home, or 90 days otherwise. The hearing is separate from the adjudicatory hearing. Reliable hearsay including psychiatric evaluations is admissible, and the standard of proof is preponderance of the evidence.",
    text: `RULE 308: DISPOSITIONAL HEARINGS

(a) Time Limits on Scheduling Dispositional Hearings. Dispositional hearings shall be held within 15 days of the adjudicatory hearing if the child is placed out of the home by court order, and within 90 days in all other cases. Continuances may be granted upon good cause shown.

(b) Separate from Adjudicatory Hearing. The dispositional hearing must be separate and distinct from the adjudicatory hearing but may occur immediately following it or later.

(c) Notice of Right to Appeal. At the conclusion of the dispositional hearing, the court shall advise the parties of the right to appeal the dispositional order.

(d) Temporary Order. When a dispositional hearing is continued, the court may enter a temporary order that is in the best interest of the child.

(e) Evidence Admissible; Standard of Proof. The court considers only formally admitted evidence and the juvenile court record. Testimony occurs under oath and reliable hearsay including, but not limited to, documents such as psychiatric or psychological screenings may be admitted, provided opposing parties can rebut. The standard of proof at the dispositional hearing is preponderance of the evidence.`,
    tags: ["disposition", "dependent", "neglect", "hearsay", "temporary order", "placement"],
  },
  {
    id: "309",
    title: "Agreed Orders",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Procedures for resolving dependent and neglect cases through agreed orders between all parties.",
    summary: "Any or all case issues may be resolved by written agreement submitted as an agreed order. When signed by all parties and approved by the court, it becomes an official court order. All parties including DCS and interveners must consent, and the agreement should warn that noncompliance may result in contempt.",
    text: `RULE 309: AGREED ORDERS

(a) General Provisions. Any or all issues within a case may be resolved by a written agreement between all parties, submitted to the court in the form of an agreed order. An agreed order, when signed by all parties or counsel and approved by the court, becomes an official court order. The agreement should note that parties understand this constitutes a court order and that non-compliance may result in contempt charges.

(b) Modification. An agreed order may be modified in accordance with Rule 310.

Advisory Commission Comments:

All parties to original proceedings -- including the Department of Children's Services and any interveners -- must consent for an order to qualify as agreed. Parties wishing to withdraw may request court approval for dismissal.

A 2018 comment noted the rule permits courts to accept stipulations entered by parties during pending cases.`,
    tags: ["agreed order", "settlement", "consent", "stipulation", "contempt"],
  },
  {
    id: "310",
    title: "Modification of or Relief from Judgments or Orders",
    part: "Dependent, Neglected, and Abused Children",
    partNum: 3,
    description: "Procedures for modifying or obtaining relief from judgments and orders in dependent and neglect cases.",
    summary: "Courts may correct clerical errors at any time and modify orders for newly discovered evidence or changed circumstances in the child's best interest. Orders may be set aside for fraud, jurisdictional defects, or newly discovered evidence. Changed circumstances relief requires a petition served under Rule 103.",
    text: `RULE 310: MODIFICATION OF OR RELIEF FROM JUDGMENTS OR ORDERS

(a) Modification of Orders.

(1) Clerical Mistakes. Courts may correct clerical errors at any time, either independently or upon party motion. During the pendency of an appeal such mistakes may be so corrected before the record on appeal is transmitted to the appellate court and thereafter, while the appeal is pending, may be so corrected with leave of the appellate court.

(2) Newly Discovered Evidence. Dispositional orders may be modified based on newly discovered evidence when the court, in making this determination, shall make any modification consistent with the best interests of the child.

(3) Changed Circumstances. Court orders may be modified when changed circumstances and the best interests of the child require it.

(b) Relief from Judgments or Orders.

Orders may be set aside if:

(1) Obtained by fraud or mistake meeting civil action requirements;

(2) Court lacked jurisdiction over necessary parties or subject matter;

(3) Newly discovered evidence exists where the movant was without fault in failing to present such evidence at the original proceeding, and that such evidence may have resulted in a different judgment.

(c) Procedure. Parties, guardians ad litem, or interested persons may seek relief. Subdivisions (a)(1), (a)(2), and (b) require motions with notice under Rule 106. Subdivision (a)(3) requires petitions served under Rule 103.

(d) Disposition. Courts grant or deny relief based on evidence. Approved modifications may result in any permissible dispositional remedy or scheduling of new dispositional hearings.`,
    tags: ["modification", "relief", "clerical error", "changed circumstances", "newly discovered evidence"],
  },
  {
    id: "401",
    title: "Ratification Hearings",
    part: "Foster Care Review Board",
    partNum: 4,
    description: "Comprehensive procedures for ratification hearings to review and approve permanency plans for children in foster care.",
    summary: "Courts review permanency plans for foster children, examining party participation, goal appropriateness, placement safety, child well-being, visitation sufficiency, and statement of responsibilities. Evidentiary hearings are required when parties disagree or the guardian ad litem objects. Courts must explain abandonment criteria and termination consequences.",
    text: `RULE 401: RATIFICATION HEARINGS

(a) Purpose of Ratification Hearing. The court shall explain on the record the purpose of the hearing.

(b) Notification of Parties. The court shall verify all parties have been properly served. In the event a party's whereabouts are unknown and the party could not be notified of the ratification hearing, the court shall determine the Department of Children's Services' reasonable efforts to notify the party of the contents of the permanency plan. If the court finds the Department has made reasonable efforts to notify the party of the contents of the plan, then the court shall proceed with the ratification of the plan.

(c) Review of Permanency Plan. The court shall review the permanency plan for each child in foster care. In reviewing the permanency plan, the court shall address the following:

(1) Whether the parties participated in the development of the plan and are in agreement with the provisions of the plan;

(2) Whether the permanency goals are appropriate, and if a concurrent goal is needed;

(3) Whether the plan includes outcomes and corresponding action steps for each permanency goal;

(4) Whether the child's placement is safe and appropriate;

(5) Whether the child's well-being is appropriately addressed through health, education and independent living skills if applicable;

(6) Whether the visitation schedule is sufficient to maintain the bond between the child and parent, and the child and siblings, who are not residing in the same placement; and

(7) Whether the statement of responsibilities for each party are reasonably related to remedying the conditions that necessitate foster care or prevent the child from safely returning home.

(d) Inclusion of Recommendations of Foster Care Review Board. If a foster care review board hearing has occurred prior to the ratification hearing, the court shall review the recommendations of the board. If the board's recommendations are in the best interest of the child, the court shall incorporate the recommendations into the plan.

(e) Evidentiary Hearing. An evidentiary hearing shall be required to ratify the plan if the following occur:

(1) The parties do not agree on the provisions of the plan;

(2) The guardian ad litem objects to the provisions of the plan; or

(3) The court determines the Department has not prioritized the outcomes and corresponding action steps for each party in the statement of responsibilities.

(f) Agreement - Modification. If the parties are in agreement to the provisions of the plan and the plan is found to be in the best interest of the child, or at the conclusion of the hearing, the court shall ratify the plan upon making fact-specific findings pursuant to T.C.A. Section 37-2-403. If the court modifies the plan, and a party is not present at the hearing, the court shall direct the Department to make reasonable efforts to notify the party of the modified provisions of the plan.

(g) Abandonment Criteria. The court shall explain on the record the law relating to abandonment and the possible consequences of termination of parental rights.

(h) Rights of Party Not Served. The court may issue a temporary order ratifying the plan. Such order shall be without prejudice to the rights of any party who has not been served with the original petition. If a party was not served, the court shall set a hearing within 60 days to determine whether the Department has conducted a diligent search.

(i) Findings - Order. The court shall make fact-specific findings pursuant to T.C.A. Section 37-2-403 and shall enter an order within 30 days of the hearing.`,
    tags: ["ratification", "permanency plan", "foster care", "abandonment", "visitation", "well-being"],
  },
  {
    id: "402",
    title: "Periodic Progress Reviews",
    part: "Foster Care Review Board",
    partNum: 4,
    description: "Procedures for periodic progress review hearings when no foster care review board is established or cases are reviewed by the court directly.",
    summary: "Periodic progress reviews occur when the court has not established a foster care review board or reviews certain cases directly. The court reviews permanency goal appropriateness, placement safety, child well-being, visitation, DCS efforts, and parental compliance. Orders must include fact-specific findings and timelines.",
    text: `RULE 402: PERIODIC PROGRESS REVIEWS

(a) A periodic progress review hearing shall occur when the court has not established a foster care review board or has elected to review certain cases instead of assigning the cases to the board.

(b) The court shall explain on the record the purpose of the hearing and review the following:

(1) The continued appropriateness of the permanency goals, and if a concurrent goal is needed;

(2) Whether the child's placement is safe and appropriate;

(3) Whether the child's well-being is being appropriately addressed through health, education, and independent living skills if applicable;

(4) Whether the visitation schedule continues to be sufficient to maintain the bond between the child and parent, and the child and siblings, who are not residing in the same placement;

(5) The reasonableness of the Department of Children's Services' efforts to identify or locate the parent or child whose identity or whereabouts are unknown;

(6) The reasonableness of the Department's efforts based on the prioritization of the outcomes and corresponding action steps in the statement of responsibilities; and

(7) The compliance of the parents or child with the statement of responsibilities in the plan.

(c) If a foster care review board hearing has occurred prior to the periodic progress review, the court shall review the recommendations of the board. If the court finds the board's recommendations are in the best interest of the child, the court shall incorporate the recommendations into the plan.

(d) If in addition to the periodic progress review the Department requests the court also ratify a new permanency plan, the periodic progress review and ratification hearing on the new plan shall be bifurcated.

(e) At the conclusion of the hearing, the court shall make fact-specific findings including a timeline for goal completion and shall enter an order within 30 days of the hearing. If the court finds additional services are necessary to mitigate the causes necessitating foster care, the court shall order the Department to incorporate the services into the permanency plan.`,
    tags: ["periodic review", "progress", "foster care", "permanency", "compliance", "placement"],
  },
  {
    id: "403",
    title: "Foster Care Review Board",
    part: "Foster Care Review Board",
    partNum: 4,
    description: "Establishes procedures for foster care review board operations, including scheduling, documentation, quorum, conduct, and judicial review of recommendations.",
    summary: "Foster care review boards review children's safety, well-being, and permanency. DCS provides documentation at least 7 days prior. Boards make written majority recommendations after deliberating outside parties' presence. The court receives recommendations within 10 judicial days and confirms them as court orders at subsequent hearings.",
    text: `RULE 403: FOSTER CARE REVIEW BOARD

(a) Scheduling and Notice. The court determines the date, time, and location of each foster care review board, notifying the Department of Children's Services and board members no later than 14 calendar days prior. All parties, attorneys, guardians ad litem, and foster parents receive written notice at least 10 calendar days before the scheduled review.

(b) Documentation. The Department provides supporting documentation regarding the child's safety, well-being, and permanency as determined by local rule, submitted to the court facilitator no less than 7 calendar days prior for distribution to board members.

(c) Quorum and Attendance. The court facilitator verifies quorum exists before each review and inquires about conflicts of interest requiring recusal. The review proceeds only if all necessary absent persons received proper notification; otherwise, rescheduling occurs.

(d) Conduct of the Review. The board uses a summary form to gather information from persons present or documentation provided by parties. Only parties, attorneys, the child, and the guardian ad litem may remain throughout; other necessary persons present information in parties' presence. The board may hear from the child separately.

(e) Recommendations. The board makes written recommendations addressing safety, well-being, and permanency, deliberating outside parties' presence. Recommendations require majority agreement; absent consensus, the court facilitator identifies conflicts and may make a direct referral to court.

(f) Announcement and Next Review. After deliberation, the board announces recommendations and schedules the next review. The court facilitator obtains all parties' signatures on the summary form.

(g) Summary Form Filed. The court facilitator files the summary form with the clerk, who records filing time and sends copies to all parties and attorneys.

(h) Judicial Review. The court receives recommendations within 10 judicial days to review whether they serve the child's best interest and confirms them as court orders at subsequent hearings.

(i) Direct Referral. When warranted, the court facilitator files direct referrals per T.C.A. Section 37-2-406(c)(1)(B) and informs the board of outcomes.

(j) Statements of Child. Any statements made by a child at the review are not admissible in a delinquent or unruly proceeding prior to a dispositional hearing.`,
    tags: ["foster care review board", "recommendations", "quorum", "safety", "well-being", "permanency"],
  },
  {
    id: "404",
    title: "Permanency Hearings",
    part: "Foster Care Review Board",
    partNum: 4,
    description: "Procedures for permanency hearings to evaluate progress toward permanent placement for children in foster care.",
    summary: "Permanency hearings require the court to review prior orders and board recommendations, receive testimony on DCS efforts, parental compliance, and permanency goal progress. Special provisions apply for youth 17 or older regarding transition to adulthood. Permanency and ratification hearings must be bifurcated.",
    text: `RULE 404: PERMANENCY HEARINGS

(a) Review of Previous Orders and Recommendations by Court. The court must examine prior ratification orders, periodic progress review orders, and foster care review board recommendations before the permanency hearing starts.

(b) Purpose of Hearing. The court shall explain the hearing's purpose on the record.

(c) Testimony. The court shall receive testimony addressing:

(1) Whether Department efforts to assist parent or child in complying with the statement of responsibilities are reasonable based on prioritization of outcomes and action steps in the permanency plan;

(2) Whether the parent or child substantially complies with the statement of responsibilities;

(3) If the child can communicate, the child's views on plan provisions;

(4) Whether the independent or transitional living plan prepares foster youth for transition to adulthood through life skills development;

(5) For seventeen-year-old youth, Department testimony about extended foster care services at eighteen and youth understanding of available services;

(6) Whether proposed permanency goals and timelines serve the child's best interests; and

(7) Whether barriers to achieving permanency goals exist and what services are needed.

(d) Reasonable Efforts Finding. The court must make fact-specific findings regarding whether the Department provided reasonable efforts consistent with the permanency plan's goal or goals.

(e) Hearing for Youth Seventeen or Older. A permanency hearing occurs three months before a youth seventeen or older leaves foster care, reviewing the transition living plan regarding support systems, education, employment, health needs, available benefits, transportation, essential documentation, and special factors.

(f) Youth Accepting Foster Care Extension. For youth accepting extended foster care, the court sets a confirmation hearing within sixty days of eligibility.

(g) Bifurcated Hearings. Permanency hearings and ratification hearings on new plans shall be separate, with the permanency hearing occurring first.`,
    tags: ["permanency", "foster care", "transition", "independent living", "reasonable efforts", "aging out"],
  },
];

export function searchTRJPP(query: string): TRJPPRule[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return trjppRules
    .map((rule) => {
      let score = 0;
      if (rule.id.toLowerCase() === q) score += 100;
      else if (rule.id.toLowerCase().includes(q)) score += 50;
      if (rule.title.toLowerCase().includes(q)) score += 30;
      for (const tag of rule.tags) {
        if (tag.toLowerCase().includes(q)) score += 20;
        if (q.includes(tag.toLowerCase())) score += 15;
      }
      if (rule.description.toLowerCase().includes(q)) score += 10;
      const words = q.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue;
        if (rule.summary.toLowerCase().includes(word)) score += 5;
        if (rule.title.toLowerCase().includes(word)) score += 8;
        if (rule.text.toLowerCase().includes(word)) score += 3;
      }
      return { rule, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.rule);
}
