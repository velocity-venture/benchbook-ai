// Tennessee Code Annotated — Key sections for Juvenile Court judges
// Covers Title 37 (Juveniles), Title 36 (Domestic Relations), and related provisions

export interface TCASection {
  id: string;
  title: string;
  chapter: string;
  titleNum: string;
  description: string;
  summary: string;
  tags: string[];
}

export const tcaSections: TCASection[] = [
  // ========================================
  // TITLE 37, CHAPTER 1 — JUVENILE COURTS
  // ========================================
  {
    id: "37-1-101",
    title: "Short title",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Short title — Tennessee Juvenile Court Act",
    summary: "This part shall be known and may be cited as the 'Juvenile Court Act of Tennessee.' Establishes the statutory framework for juvenile courts.",
    tags: ["general", "jurisdiction"],
  },
  {
    id: "37-1-102",
    title: "Definitions",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Key definitions for juvenile court proceedings",
    summary: "Defines 'child,' 'delinquent child,' 'unruly child,' 'dependent and neglected child,' 'deprived child,' 'custody,' 'guardian,' and other key terms. A child is any person under 18 years of age. Delinquent child: committed an act designated a crime. Unruly child: habitually truant, beyond parental control, or commits a status offense. Dependent and neglected: without proper parental care or whose home is unfit.",
    tags: ["definitions", "delinquent", "unruly", "dependent", "neglect", "custody"],
  },
  {
    id: "37-1-103",
    title: "Jurisdiction",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Jurisdiction of the juvenile court",
    summary: "Juvenile court has exclusive original jurisdiction over proceedings involving delinquent, unruly, or dependent/neglected children. Also covers custody, parentage, and child abuse proceedings. Concurrent jurisdiction with other courts for certain matters. Jurisdiction continues until the child reaches 19 years of age for delinquency matters.",
    tags: ["jurisdiction", "authority", "exclusive", "concurrent"],
  },
  {
    id: "37-1-104",
    title: "Venue",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Venue for juvenile proceedings",
    summary: "Proceedings shall be commenced in the county where the child resides or is found. Transfer of venue permitted when in the best interest of the child. When the child's residence changes, the case may be transferred to the county of new residence.",
    tags: ["venue", "transfer", "residence", "county"],
  },
  {
    id: "37-1-106",
    title: "Sessions of court",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "How juvenile court sessions are conducted",
    summary: "Juvenile court shall be in session at all times as a court of record. Proceedings shall be conducted informally but in an orderly manner. The general public shall be excluded from juvenile proceedings. Only parties, counsel, witnesses, and others the court finds have a proper interest may be present.",
    tags: ["court sessions", "confidentiality", "closed proceedings", "public exclusion"],
  },
  {
    id: "37-1-107",
    title: "Judge qualification and authority",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Qualifications and authority of juvenile court judge",
    summary: "Juvenile court judge shall be learned in the law and a licensed attorney. Has authority to issue orders necessary for enforcement of court orders, including contempt. May appoint referees, masters, and other officers. Judge shall receive training in juvenile law and child development.",
    tags: ["judge", "qualifications", "authority", "contempt", "training"],
  },
  {
    id: "37-1-111",
    title: "Petition — commencement of proceedings",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "How juvenile proceedings are initiated",
    summary: "Proceedings commenced by petition filed by any person, including law enforcement, DCS, school official, or private citizen. Petition must set forth: name of child, date of birth, parents/guardians, specific factual allegations, and the relief sought. Petition shall be verified and filed with the clerk.",
    tags: ["petition", "filing", "commencement", "allegations"],
  },
  {
    id: "37-1-112",
    title: "Summons — notice",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Summons and notice requirements",
    summary: "After petition filed, court issues summons to child and parents/guardians. Summons must state time, place, and purpose of hearing. Must be served personally at least 48 hours before hearing. If personal service cannot be made, service by publication permitted under certain circumstances.",
    tags: ["summons", "notice", "service", "due process"],
  },
  {
    id: "37-1-113",
    title: "Taking into custody",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "When a child may be taken into custody",
    summary: "A child may be taken into custody: (1) pursuant to court order; (2) by law enforcement with probable cause of delinquent act; (3) by law enforcement when conditions endanger the child's health or welfare; (4) by DCS worker pursuant to investigation. Officer taking child into custody shall immediately notify parents and bring child before the court or detention facility.",
    tags: ["custody", "arrest", "probable cause", "law enforcement", "DCS"],
  },
  {
    id: "37-1-114",
    title: "Criteria for detention of child",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Grounds and procedures for juvenile detention",
    summary: "A child taken into custody shall not be detained unless: (1) alleged to have committed act that would be felony if by adult AND detention necessary for protection of community or child; (2) already detained or on conditional release; (3) fugitive from another jurisdiction; (4) no parent/guardian available. Detention hearing required within 48 hours (excluding non-judicial days). Court must find no less restrictive alternative exists. Written findings required.",
    tags: ["detention", "criteria", "hearing", "48 hours", "felony", "alternatives"],
  },
  {
    id: "37-1-115",
    title: "Shelter care and detention facilities",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Types and standards for detention facilities",
    summary: "Children may be placed in shelter care (non-secure) or detention (secure). Facilities must be licensed and meet state standards. Status offenders and dependent/neglected children shall NOT be placed in secure detention. Sight and sound separation from adult inmates required. Regular inspection of facilities by the court.",
    tags: ["shelter care", "detention facility", "secure", "non-secure", "status offenders", "separation"],
  },
  {
    id: "37-1-116",
    title: "Right to counsel",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Right to attorney in juvenile proceedings",
    summary: "The child and parents have the right to be represented by counsel at all stages of proceedings. If the family cannot afford counsel, the court shall appoint an attorney. The child's attorney represents the child's expressed wishes, not the attorney's view of the child's best interest. Guardian ad litem may be appointed separately when interests conflict.",
    tags: ["right to counsel", "attorney", "guardian ad litem", "appointed counsel", "indigent"],
  },
  {
    id: "37-1-117",
    title: "Conduct of hearings",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Rules for conducting juvenile hearings",
    summary: "Hearings conducted in informal but orderly manner. Rules of evidence apply but may be relaxed for dispositional hearings. Adjudicatory hearing: proof beyond reasonable doubt for delinquency, clear and convincing evidence for dependency. Child has right to confront witnesses. Bifurcated proceedings: adjudication first, then disposition. Record shall be made of all proceedings.",
    tags: ["hearing", "evidence", "beyond reasonable doubt", "clear and convincing", "confrontation", "bifurcated"],
  },
  {
    id: "37-1-119",
    title: "Social study and investigation",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Pre-disposition social study requirements",
    summary: "Before disposition, court shall order a social study. Includes: child's background, family history, school records, mental health, prior court involvement, and community resources. Study prepared by court counselor, DCS, or other designated agency. Results not admissible at adjudicatory hearing but considered at disposition.",
    tags: ["social study", "investigation", "pre-disposition", "background", "family history"],
  },
  {
    id: "37-1-128",
    title: "Adjudication",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Adjudicatory findings and standards",
    summary: "At adjudicatory hearing, court determines whether allegations in petition are established. For delinquency: beyond a reasonable doubt. For dependency/neglect: clear and convincing evidence. For unruly: preponderance of the evidence. Court must make written findings. Adjudication is not a criminal conviction.",
    tags: ["adjudication", "findings", "standard of proof", "delinquent", "dependent", "unruly"],
  },
  {
    id: "37-1-129",
    title: "Dispositions — delinquent child",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Available dispositional alternatives for delinquent children",
    summary: "Court may: (1) place on probation with conditions; (2) commit to DCS custody (max to age 19); (3) order restitution; (4) order community service; (5) impose suspended commitment; (6) order counseling/treatment; (7) any combination. Court shall consider least restrictive alternative consistent with public safety and child's best interest. Commitment to DCS is disposition of last resort.",
    tags: ["disposition", "probation", "commitment", "DCS", "restitution", "community service", "least restrictive"],
  },
  {
    id: "37-1-130",
    title: "Dispositions — dependent/neglected child",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Dispositional options for dependent/neglected children",
    summary: "Court may: (1) permit child to remain with parent under supervision; (2) place with relative or suitable person; (3) commit to DCS custody; (4) order services for family. Reasonable efforts must be made to prevent removal. If removed, reasonable efforts to reunify required. Permanency hearing within 12 months of custody removal.",
    tags: ["disposition", "dependent", "neglect", "DCS custody", "reasonable efforts", "reunification", "permanency"],
  },
  {
    id: "37-1-131",
    title: "Disposition considerations",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Factors court must consider in disposition",
    summary: "Court shall consider: (1) nature and circumstances of the offense or conditions; (2) child's age, maturity, and needs; (3) child's prior record; (4) programs and services available; (5) risk to public safety; (6) least restrictive alternative. The primary purpose of disposition is rehabilitation, not punishment.",
    tags: ["disposition factors", "best interest", "rehabilitation", "least restrictive", "public safety"],
  },
  {
    id: "37-1-132",
    title: "Review hearings",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Periodic review of dispositional orders",
    summary: "Court shall conduct review hearings at least every 6 months for children in DCS custody. Court reviews progress toward permanency plan goals. May modify disposition based on changed circumstances. Child has right to be present and heard. Written findings required at each review.",
    tags: ["review hearing", "periodic review", "DCS custody", "permanency", "modification"],
  },
  {
    id: "37-1-134",
    title: "Transfer to criminal court",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Procedures for transferring juveniles to criminal court",
    summary: "Motion to transfer must be filed by the State. Child must be at least 16 (or 14 for certain violent felonies). Court considers: (1) seriousness of offense; (2) whether offense was against person; (3) child's maturity; (4) prior record; (5) likelihood of rehabilitation; (6) programs available. Full investigation and hearing required. Burden on State to show transfer warranted by clear and convincing evidence.",
    tags: ["transfer", "criminal court", "waiver", "certification", "adult prosecution", "violent felony"],
  },
  {
    id: "37-1-137",
    title: "Contempt of court",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Contempt powers of juvenile court",
    summary: "Court may hold any person in contempt for: willful violation of court order, failure to appear, disruptive behavior. Sanctions include fines and imprisonment (up to 10 days). For children, contempt sanctions must consider the child's age and developmental level. Purge conditions required for coercive contempt.",
    tags: ["contempt", "sanctions", "fine", "imprisonment", "violation of court order"],
  },
  {
    id: "37-1-139",
    title: "Fingerprinting and photographs",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "When juvenile fingerprints and photos may be taken",
    summary: "Fingerprints and photographs may be taken of a child alleged to have committed a felony. Records maintained separately from adult records. Not released to public. May be transmitted to TBI for identification purposes. Court may order expungement of records if child not adjudicated.",
    tags: ["fingerprints", "photographs", "records", "felony", "TBI", "expungement"],
  },
  {
    id: "37-1-146",
    title: "Sealing of records",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Expungement and sealing of juvenile records",
    summary: "Court may order sealing of records on motion of the person who was subject of proceedings. Available after: (1) at least one year since final discharge; (2) no subsequent adjudication or conviction; (3) no pending proceedings. Sealed records not open to inspection except by court order. Effect of sealing: proceedings deemed never to have occurred for most purposes.",
    tags: ["sealing", "expungement", "records", "confidentiality", "discharge"],
  },
  {
    id: "37-1-150",
    title: "Confidentiality of records",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Confidentiality requirements for juvenile records",
    summary: "Juvenile court records are not public records. Access limited to: parties, attorneys, DCS, law enforcement (for investigation), and schools (limited information). FERPA and HIPAA protections apply. Violation of confidentiality provisions is a Class A misdemeanor. Court may authorize disclosure in limited circumstances for good cause shown.",
    tags: ["confidentiality", "records", "FERPA", "HIPAA", "disclosure", "privacy"],
  },
  {
    id: "37-1-152",
    title: "Interstate Compact on Juveniles",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Interstate transfer of juvenile supervision",
    summary: "Tennessee participates in the Interstate Compact on Juveniles (ICJ). Governs return of runaways, absconders, and escapees. Transfer of probation supervision between states. Requires compact approval before juvenile can move across state lines while under supervision.",
    tags: ["interstate compact", "ICJ", "transfer", "supervision", "runaway"],
  },

  // ========================================
  // TITLE 37, CHAPTER 1 — DETENTION SPECIFICS
  // ========================================
  {
    id: "37-1-114a",
    title: "Detention hearing requirements",
    chapter: "Juvenile Courts and Proceedings",
    titleNum: "37",
    description: "Procedural requirements for detention hearings",
    summary: "Detention hearing must be held within 48 hours of taking child into custody (excluding non-judicial days). Child has right to counsel. Court must determine: (1) probable cause to believe child committed alleged offense; (2) continued detention is necessary; (3) no less restrictive alternative exists. Written findings required. If hearing not held within 48 hours, child must be released.",
    tags: ["detention hearing", "48 hours", "probable cause", "release", "findings"],
  },

  // ========================================
  // TITLE 37, CHAPTER 2 — DCS
  // ========================================
  {
    id: "37-2-403",
    title: "Child abuse reporting",
    chapter: "Department of Children's Services",
    titleNum: "37",
    description: "Mandatory reporting requirements for child abuse",
    summary: "Any person who has knowledge of or is called upon to render aid to a child suspected of being abused or neglected SHALL report immediately to DCS or law enforcement. Mandatory reporters include: judges, teachers, doctors, nurses, social workers, and childcare workers. Failure to report is a Class A misdemeanor. Good faith reporters are immune from liability.",
    tags: ["mandatory reporting", "child abuse", "DCS", "immunity", "misdemeanor", "neglect"],
  },
  {
    id: "37-2-405",
    title: "Child abuse investigation",
    chapter: "Department of Children's Services",
    titleNum: "37",
    description: "DCS investigation procedures for abuse reports",
    summary: "DCS shall initiate investigation within specified timeframes based on severity. Severe abuse: investigation within 24 hours. Other reports: within 5 days. Investigation includes: interview with child, home visit, review of records. DCS may request court order for examination of child. Classification: substantiated, unsubstantiated, or indicated.",
    tags: ["investigation", "DCS", "child abuse", "timeframes", "classification", "substantiated"],
  },
  {
    id: "37-2-409",
    title: "Removal of child from home",
    chapter: "Department of Children's Services",
    titleNum: "37",
    description: "Emergency removal procedures",
    summary: "DCS may seek court order for emergency removal when child in imminent danger. Without court order, removal only when: (1) child in immediate danger of serious bodily injury or death; AND (2) no time to obtain court order. Petition must be filed within 72 hours. Preliminary hearing within 72 hours of removal. Court determines whether reasonable efforts made to prevent removal.",
    tags: ["emergency removal", "imminent danger", "72 hours", "preliminary hearing", "reasonable efforts"],
  },

  // ========================================
  // TITLE 36 — DOMESTIC RELATIONS
  // ========================================
  {
    id: "36-1-102",
    title: "Definitions — Adoption",
    chapter: "Adoption",
    titleNum: "36",
    description: "Definitions related to adoption proceedings",
    summary: "Defines adoption-related terms including: 'abandoned child,' 'surrender,' 'putative father,' 'prospective adoptive parent.' Abandoned: parent has willfully failed to visit or support child for 4 consecutive months. Establishes framework for termination of parental rights as prerequisite to adoption.",
    tags: ["adoption", "definitions", "abandoned", "surrender", "putative father"],
  },
  {
    id: "36-1-113",
    title: "Termination of parental rights — Grounds",
    chapter: "Adoption",
    titleNum: "36",
    description: "Grounds for termination of parental rights",
    summary: "Parental rights may be terminated on grounds of: (1) abandonment (4+ months); (2) substantial noncompliance with permanency plan; (3) persistent conditions preventing safe return; (4) severe child abuse; (5) mental incompetence to care for child; (6) incarceration 10+ years for certain offenses; (7) failure to establish paternity. Clear and convincing evidence standard. Must also find termination in best interest of child.",
    tags: ["termination", "parental rights", "TPR", "abandonment", "permanency plan", "best interest"],
  },
  {
    id: "36-1-113(g)",
    title: "Best interest factors — TPR",
    chapter: "Adoption",
    titleNum: "36",
    description: "Best interest analysis for termination of parental rights",
    summary: "Court must consider: (1) whether parent has made adjustment of circumstances; (2) whether parent maintained regular visitation; (3) whether meaningful relationship exists between parent and child; (4) effect of change in caretakers on child; (5) child's need for continuity and stability; (6) physical, mental and emotional needs of child; (7) child's preference if old enough.",
    tags: ["best interest", "TPR", "factors", "visitation", "stability", "relationship"],
  },
  {
    id: "36-1-116",
    title: "TPR hearing procedures",
    chapter: "Adoption",
    titleNum: "36",
    description: "Procedural requirements for TPR hearings",
    summary: "Petition for TPR must be filed and personally served on all parties. Parents have right to counsel; appointment of counsel if indigent. Guardian ad litem appointed for child. Hearing must be held no later than 30 days from filing. Clear and convincing evidence standard. Court makes written findings on each ground alleged and best interest determination.",
    tags: ["TPR hearing", "service", "right to counsel", "guardian ad litem", "findings"],
  },
  {
    id: "36-3-601",
    title: "Orders of protection",
    chapter: "Domestic Abuse",
    titleNum: "36",
    description: "Orders of protection in domestic abuse cases",
    summary: "Court may issue ex parte order of protection when petitioner in immediate and present danger. Full hearing within 15 days. Order may include: prohibition of contact, exclusive possession of residence, temporary custody of children, mandatory counseling. Violation is criminal contempt and a Class A misdemeanor.",
    tags: ["order of protection", "domestic abuse", "ex parte", "temporary custody", "violation"],
  },

  // ========================================
  // TITLE 37, CHAPTER 5 — EDUCATION
  // ========================================
  {
    id: "37-5-106",
    title: "Truancy proceedings",
    chapter: "Education — Attendance",
    titleNum: "37",
    description: "Court proceedings for truancy",
    summary: "Petition may be filed alleging child is truant (unruly). School must document: progressive interventions attempted, notification to parents, attendance records. Court may order: counseling, attendance monitoring, community service, parent education. Commitment for truancy alone is prohibited. Focus on identification and removal of barriers to attendance.",
    tags: ["truancy", "unruly", "school attendance", "interventions", "education"],
  },

  // ========================================
  // KEY PROCEDURAL RULES (TRJPP)
  // ========================================
  {
    id: "TRJPP-1",
    title: "Scope of Rules",
    chapter: "TN Rules of Juvenile Practice and Procedure",
    titleNum: "Rules",
    description: "Scope and purpose of juvenile court rules",
    summary: "These rules govern practice and procedure in all juvenile courts in Tennessee. Where not covered, Rules of Civil Procedure apply. Rules shall be construed to ensure fair, speedy, and inexpensive determination of proceedings. Best interest of the child is paramount consideration.",
    tags: ["rules", "procedure", "scope", "civil procedure"],
  },
  {
    id: "TRJPP-5",
    title: "Service of process",
    chapter: "TN Rules of Juvenile Practice and Procedure",
    titleNum: "Rules",
    description: "How service is accomplished in juvenile proceedings",
    summary: "Summons served by sheriff, constable, or process server. Personal service required for initial proceedings. Service by mail for subsequent proceedings if address known. Publication service as last resort. Service on child: if 12+, serve child directly; if under 12, serve parent/guardian. 48 hours before hearing minimum.",
    tags: ["service", "process", "summons", "personal service", "publication"],
  },
  {
    id: "TRJPP-16",
    title: "Discovery in juvenile proceedings",
    chapter: "TN Rules of Juvenile Practice and Procedure",
    titleNum: "Rules",
    description: "Discovery rules for juvenile cases",
    summary: "Both parties entitled to discovery. State must disclose: witness lists, statements, reports, exculpatory evidence. Defense must disclose: alibi, expert witnesses. Discovery must be completed before adjudicatory hearing. Social study not discoverable before adjudication. Sanctions for discovery violations include exclusion of evidence.",
    tags: ["discovery", "disclosure", "exculpatory", "witness list", "sanctions"],
  },
  {
    id: "TRJPP-27",
    title: "Appeal from juvenile court",
    chapter: "TN Rules of Juvenile Practice and Procedure",
    titleNum: "Rules",
    description: "Appeal procedures from juvenile court",
    summary: "Appeals from juvenile court to circuit court for trial de novo. Notice of appeal filed within 10 days of final order. Bond may be required. Pending appeal, juvenile court order remains in effect unless stayed. Child remains in placement unless court orders otherwise during appeal.",
    tags: ["appeal", "circuit court", "trial de novo", "notice of appeal", "bond", "stay"],
  },
];

// Search TCA sections by query (case-insensitive, searches id, title, description, summary, tags)
export function searchTCA(query: string): TCASection[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return tcaSections
    .map((section) => {
      let score = 0;
      // Exact section ID match
      if (section.id.toLowerCase() === q) score += 100;
      // Partial section ID match
      else if (section.id.toLowerCase().includes(q)) score += 50;
      // Title match
      if (section.title.toLowerCase().includes(q)) score += 30;
      // Tag match
      for (const tag of section.tags) {
        if (tag.toLowerCase().includes(q)) score += 20;
        if (q.includes(tag.toLowerCase())) score += 15;
      }
      // Description match
      if (section.description.toLowerCase().includes(q)) score += 10;
      // Summary match — word-level
      const words = q.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue;
        if (section.summary.toLowerCase().includes(word)) score += 5;
        if (section.title.toLowerCase().includes(word)) score += 8;
      }
      return { section, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.section);
}
