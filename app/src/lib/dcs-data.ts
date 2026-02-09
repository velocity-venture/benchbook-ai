// Tennessee Department of Children's Services (DCS) Administrative Policies and Procedures
// Covers Chapter 9 (Confidentiality), Chapter 14 (Child Protective Services), Chapter 16 (Foster Care)

export interface DCSPolicy {
  id: string;
  title: string;
  chapter: string;
  chapterNum: string;
  description: string;
  summary: string;
  tags: string[];
}

export const dcsPolicies: DCSPolicy[] = [
  // ========================================
  // CHAPTER 9 — CONFIDENTIALITY
  // ========================================
  {
    id: "9.5",
    title: "Access and Release of Confidential Child-Specific Information",
    chapter: "Confidentiality",
    chapterNum: "9",
    description:
      "Guidelines for accessing and releasing confidential child-specific records maintained by DCS",
    summary:
      "DCS ensures that records and information maintained by DCS are confidential and only accessed or released according to State and Federal laws, DCS Rules, Regulations and Policies. The access and release of confidential child-specific information is governed by TCA 33-3-103, 33-3-104, 36-1-125 through 36-1-141, 37-1-153, 37-1-409, 37-1-612, HIPAA, and DCS Rules and Regulations. DCS protects the privacy of children and families in its care while providing access to information to entities that have a need or right to know.",
    tags: [
      "confidentiality",
      "records",
      "HIPAA",
      "privacy",
      "information release",
      "child records",
      "disclosure",
    ],
  },

  // ========================================
  // CHAPTER 14 — CHILD PROTECTIVE SERVICES
  // ========================================
  {
    id: "14.1",
    title: "Child Abuse Hotline",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Operation of the statewide Child Abuse Hotline (CAH) for receiving reports of alleged child abuse or neglect",
    summary:
      "DCS maintains and operates a Child Abuse Hotline (CAH), available twenty-four hours per day, seven days per week to receive reports of alleged child abuse or neglect. The CAH manages information regarding reports of abuse and/or neglect by entering information in TFACTS, screening reports to ensure concerns of child safety are effectively identified and assigned a priority response, and sending the information to the appropriate jurisdiction for investigation or assessment. Reports may be received by email, mail, web, in person, or by telephone.",
    tags: [
      "hotline",
      "child abuse",
      "neglect",
      "reporting",
      "CAH",
      "TFACTS",
      "intake",
      "24/7",
    ],
  },
  {
    id: "14.2",
    title: "Screening, Priority Response and Assignment of CPS Cases",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Processing reports of abuse and neglect for screening decisions, track assignment, and timely response",
    summary:
      "The Child Abuse Hotline receives reports of suspected abuse and neglect. These reports are screened to determine the need for a timely investigation, assessment, or resource linkage case within the appropriate jurisdiction. The policy ensures reports of abuse and/or neglect are consistently processed for accurate screening decisions, track assignment, and timely response. Governed by TCA 37-1-401 et seq. and related standards.",
    tags: [
      "screening",
      "priority response",
      "case assignment",
      "triage",
      "intake",
      "CPS",
      "investigation",
    ],
  },
  {
    id: "14.3",
    title: "Child Protective Services Intake Analyst Responsibilities",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Direction and guidelines for CAH Intake Analyst staff in reviewing screening decisions and assigning reports",
    summary:
      "The Child Abuse Hotline Intake Analyst staff facilitate the assignment of reports of alleged child abuse and neglect from the CAH by reviewing screening decisions and assigning to the appropriate CPS staff. Provides direction and guidelines to Intake Analyst staff who ensure that the Multiple Response System is supported through screening and proper assignment of reports of child abuse and neglect.",
    tags: [
      "intake analyst",
      "screening",
      "assignment",
      "CAH",
      "multiple response system",
      "CPS staff",
    ],
  },
  {
    id: "14.4",
    title: "CPS: Locating the Child and Family",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Efforts to locate alleged child victims and their families to determine if abuse or neglect occurred",
    summary:
      "Child Protective Services and Special Investigations Unit Case Managers shall make efforts to locate the alleged child victim (ACV) and their family to determine if abuse and/or neglect have occurred and/or to determine if services are recommended or required. The purpose is to locate the ACV and family to gather information necessary to assess for safety and/or risk to the ACV.",
    tags: [
      "locating",
      "child victim",
      "family",
      "investigation",
      "safety assessment",
      "SIU",
      "case manager",
    ],
  },
  {
    id: "14.5",
    title: "Child Protective Services Multiple Response System",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Framework allowing multiple approaches in response to child abuse/neglect reports",
    summary:
      "The Multiple Response System (MRS) reflects DCS recognition that the growing complexity of issues facing children and families requires a form of Child Protective Services practice that allows for more than one approach in response to child abuse/neglect reports. Details the types of reports of abuse/neglect each team under the MRS is responsible for investigating and assessing.",
    tags: [
      "multiple response system",
      "MRS",
      "investigation",
      "assessment",
      "CPS practice",
      "teams",
    ],
  },
  {
    id: "14.6",
    title: "Child Protective Services Case Tasks and Responsibilities",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Classification, investigation tasks, and case closure procedures for CPS cases",
    summary:
      "A Child Protective Services investigation case must be classified within thirty calendar days of the Child Abuse Hotline receiving a report. An investigation is concluded within sixty calendar days with a decision to close the case, provide or refer to community services, or transfer. Ensures that CPS cases are properly classified and closed by completing critical investigative tasks, maximizing resources, and making consistent decisions to ensure the safety of the child.",
    tags: [
      "case tasks",
      "classification",
      "30-day",
      "60-day",
      "investigation",
      "case closure",
      "timelines",
      "responsibilities",
    ],
  },
  {
    id: "14.7",
    title: "Multi-Disciplinary Team: Child Protection Investigation Team",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Composition and responsibilities of the Child Protective Investigation Team (CPIT) as the mandated Multi-Disciplinary Team",
    summary:
      "The Child Protective Investigation Team (CPIT) serves as the statutorily mandated Multi-Disciplinary Team (MDT) in Tennessee. DCS uses the MDT approach during investigations of severe child abuse to ensure completion of a strategic and thorough investigation, as well as providing child victims with comprehensive services. Identifies the composition of CPIT and establishes the role and responsibilities of DCS in the CPIT process. Governed by TCA 37-1-401 et seq. and CAPTA.",
    tags: [
      "CPIT",
      "multi-disciplinary team",
      "MDT",
      "severe abuse",
      "investigation",
      "CAPTA",
      "collaboration",
    ],
  },
  {
    id: "14.8",
    title: "Child Protective Services Second Shift",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "CPS response after regular business hours and second shift team responsibilities",
    summary:
      "Ensures a Child Protective Services response after regular business hours while balancing the workload of CPS staff. Details the tasks conducted by Second Shift teams in jurisdictions where they are enacted. Second Shift CPS Teams provide primary coverage for Priority 1 (P1) referrals and any other CPS case situations that require immediate assistance from the Child Abuse Hotline for designated shift hours.",
    tags: [
      "second shift",
      "after hours",
      "priority 1",
      "P1",
      "emergency response",
      "CPS coverage",
    ],
  },
  {
    id: "14.9",
    title: "DCS Response to Allegations Involving Drug Exposed Children",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Screening, assignment, and investigation of allegations involving drug exposed children (DEC)",
    summary:
      "The Child Abuse Hotline screens and assigns allegations involving drug exposed children (DEC) and Child Protective Services or Special Investigations Unit staff respond timely based on the severity of or potential for physical, mental or emotional harm to the child. Assists the CAH in determining track and priority response for allegations of DEC and provides CPS Case Managers with guidance for classifying allegations. Governed by TCA 37-1-401 and the Comprehensive Addiction and Recovery Act (CARA) of 2016.",
    tags: [
      "drug exposed children",
      "DEC",
      "substance abuse",
      "CARA",
      "prenatal",
      "neonatal",
      "NAS",
      "classification",
    ],
  },
  {
    id: "14.10",
    title: "Special Investigations Unit CPS Investigations",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "SIU investigations of abuse/neglect allegations for children in DCS custody or involving official employees",
    summary:
      "The DCS Special Investigations Unit (SIU) conducts investigations on allegations of child abuse and neglect which occur while a child is in DCS custody or when the case involves non-custodial children where the alleged perpetrator is acting in an official employment capacity. Provides DCS SIU employees with additional guidelines for conducting timely and effective investigations. Governed by TCA 37-5-105(3), 37-5-106, and PREA standards.",
    tags: [
      "SIU",
      "special investigations",
      "custody",
      "institutional abuse",
      "PREA",
      "employee misconduct",
    ],
  },
  {
    id: "14.11",
    title: "CPS Case File Organization, Documentation and Disposition",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Standards for maintaining CPS case records in a confidential and standardized manner",
    summary:
      "All child protective services case records shall be maintained in a standardized confidential manner and shall be safeguarded from unauthorized and improper disclosure of information. The TFACTS record serves as the official record and a reference tool for DCS and private provider Case Managers, for collection of data and preparation of required documents, forms, and assessments on children and families served.",
    tags: [
      "case file",
      "documentation",
      "records management",
      "TFACTS",
      "confidentiality",
      "disposition",
      "case records",
    ],
  },
  {
    id: "14.12",
    title: "Family Permanency Planning for CPS Non-Custodial Cases",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Developing Family Permanency Plans for non-custodial CPS cases through Child and Family Team Meetings",
    summary:
      "DCS partners with families, their support systems, service providers, community partners, informal supports, specific interventions and services to develop a Family Permanency Plan for Child Protective Services Non-Custodial Cases (FPPNC) during a Child and Family Team Meeting (CFTM). Identifies a permanency goal, develops a plan specifying what must occur to achieve the goal, what services will be provided, and the timelines for achieving the goal. Governed by TCA 37-5-105, 37-2-403 and CARA.",
    tags: [
      "permanency planning",
      "non-custodial",
      "CFTM",
      "family team meeting",
      "permanency goal",
      "services",
      "CARA",
    ],
  },
  {
    id: "14.13",
    title: "Non-Custodial Immediate Protection Agreements",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Use of voluntary Immediate Protection Agreements to ensure child safety when a parent lacks protective capacity",
    summary:
      "DCS uses a voluntary Immediate Protection Agreement (IPA) as an option to ensure the safety of a child when the parent/legal custodian lacks sufficient protective capacity to assure the child is safe from abuse or neglect. Provides standard guidelines and procedures to address the immediate safety of a child during a CPS and Family Support Services (FSS) case when using an IPA. The CPS or FSS Case Manager assesses the risk of harm to the child prior to executing an IPA.",
    tags: [
      "IPA",
      "immediate protection",
      "voluntary agreement",
      "safety plan",
      "protective capacity",
      "non-custodial",
    ],
  },
  {
    id: "14.25",
    title: "Special Investigations Unit CPS Investigations (Supplemental)",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Additional SIU investigation guidelines for allegations involving children in DCS custody or official employees",
    summary:
      "The DCS Special Investigations Unit (SIU) conducts investigations on allegations of child abuse and neglect which occur while a child is in DCS custody or when the case involves non-custodial children where the alleged perpetrator is acting in an official employment capacity. Provides additional guidelines for conducting timely and effective SIU investigations. Governed by TCA 37-5-105(3), 37-5-106, 37-1-401 et seq.",
    tags: [
      "SIU",
      "special investigations",
      "supplemental",
      "custody",
      "institutional",
      "employee",
    ],
  },
  {
    id: "14.26",
    title: "Child Protective Services Assessment Track",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Guidelines for CPS Assessment workers to assess risk and safety and provide services to children and families",
    summary:
      "Child Protective Services Assessment (CPSA) workers assess risk and safety of children, and when appropriate, provide services to safeguard and enhance the welfare of children and preserve family life by strengthening the ability of families to parent their children while keeping the children safe from harm. Provides guidelines and timeframes to support and direct CPSA staff to investigate and assess allegations of abuse and neglect, complete assessment and investigative tasks, and render services.",
    tags: [
      "CPSA",
      "assessment track",
      "risk assessment",
      "safety",
      "family services",
      "investigation",
    ],
  },
  {
    id: "14.27",
    title: "Family Crisis Intervention Services",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Family Crisis Intervention Programs (FCIP) for stabilizing unruly juveniles and families in crisis",
    summary:
      "DCS shall provide Family Crisis Intervention Programs (FCIP) in all counties of the State. The program ensures that all appropriate community services have been utilized prior to any dependent, neglected, and unruly child entering state custody. Provides immediate services to stabilize unruly juveniles and families experiencing crises as required by TCA 37-1-168 and provides case management services to improve or ameliorate conditions and behaviors that constitute a threat of harm to children.",
    tags: [
      "FCIP",
      "family crisis",
      "intervention",
      "unruly",
      "juvenile",
      "stabilization",
      "diversion",
      "community services",
    ],
  },
  {
    id: "14.28",
    title: "Resource Linkage",
    chapter: "Child Protective Services",
    chapterNum: "14",
    description:
      "Connecting families to community resources and services to prevent harm and strengthen parenting capacity",
    summary:
      "DCS utilizes Resource Linkage (RL) to safeguard and enhance the welfare of children, preserve family life, prevent harm and abuse to children by strengthening the ability of families to parent, provide for and protect their children effectively using available community services and supports. When a case meets the criteria for RL services, DCS collaborates with public and private agencies to refer families to available resources that meet their needs.",
    tags: [
      "resource linkage",
      "community resources",
      "referral",
      "family services",
      "prevention",
      "collaboration",
    ],
  },

  // ========================================
  // CHAPTER 16 — FOSTER CARE
  // ========================================
  {
    id: "16.2",
    title: "Multi-Ethnic Placement Act / Inter-Ethnic Adoption Provision (MEPA/IEPA)",
    chapter: "Foster Care",
    chapterNum: "16",
    description:
      "Compliance with MEPA/IEPA to prevent discrimination in foster care and adoption placements based on race, color, or national origin",
    summary:
      "DCS intends to bind all agencies, organizations, or governmental units operating under its jurisdiction to fully comply with the Multi-Ethnic Placement Act amended by the Inter-Ethnic Adoption Provision of 1996. DCS strives to promote the best interest of children placed in foster care by preventing discrimination in the placement of children on the basis of race, color or national origin. This goal is met by actively recruiting and identifying resource families that reflect the ethnic and racial diversity of children in care.",
    tags: [
      "MEPA",
      "IEPA",
      "multi-ethnic",
      "adoption",
      "non-discrimination",
      "race",
      "placement",
      "diversity",
    ],
  },
  {
    id: "16.3",
    title: "Desired Characteristics of Foster Parents",
    chapter: "Foster Care",
    chapterNum: "16",
    description:
      "Standards and desired characteristics for identifying and approving foster parents",
    summary:
      "DCS, Interstate Compact on the Placement of Children (ICPC) and DCS Contract Agencies identify desired characteristics of foster parents to ensure the safety, permanency, and well-being of children/youth served. DCS also sets standards of approval for its foster homes. The procedures in this policy are for use as a guide in recruiting prospective foster parents. Governed by TCA 37-4-201-207, Adoption and Safe Families Act, and Preventing Sex Trafficking and Strengthening Families Act of 2014.",
    tags: [
      "foster parent",
      "characteristics",
      "qualifications",
      "recruitment",
      "ICPC",
      "approval standards",
    ],
  },
  {
    id: "16.4",
    title: "Foster Home Selection and Approval",
    chapter: "Foster Care",
    chapterNum: "16",
    description:
      "Guidelines for identifying and approving qualified foster homes for placement of youth in DCS custody",
    summary:
      "DCS recruits foster parents who are capable of providing for the safety, permanency, and well-being of children. This policy applies to traditional non-related applicants desiring to become a potential placement resource for children. Approved relative/kinship foster parents desiring to serve children outside their family may also apply. Provides guidelines for identifying and approving qualified foster homes. Governed by TCA 37-4-201-207, Adam Walsh Child Protection and Safety Act of 2006, and Bipartisan Budget Act of 2018.",
    tags: [
      "foster home",
      "selection",
      "approval",
      "background check",
      "home study",
      "kinship",
      "Adam Walsh Act",
    ],
  },
  {
    id: "16.7",
    title: "Foster Family Recruitment and Retention",
    chapter: "Foster Care",
    chapterNum: "16",
    description:
      "Regional recruitment plans for recruiting and retaining a diverse pool of foster families",
    summary:
      "DCS develops and maintains regional recruitment plans for the recruitment and retention of foster families. These plans are developed in collaboration with local community partners, faith-based communities, and contract providers and are updated annually. The goal is to recruit and maintain a diverse pool of approved foster and kinship families that ensure quality home placements for children in DCS custody.",
    tags: [
      "recruitment",
      "retention",
      "foster family",
      "regional plans",
      "diversity",
      "community partners",
      "faith-based",
    ],
  },
  {
    id: "16.8",
    title: "Responsibilities of Approved Foster Homes",
    chapter: "Foster Care",
    chapterNum: "16",
    description:
      "Requirements and responsibilities for approved foster parents serving children in accordance with DCS policies",
    summary:
      "All approved foster parents, including those involved with the Interstate Compact on the Placement of Children (ICPC), serve children in their home in accordance with DCS Policies and Procedures. DCS and contract agencies ensure that approved foster parents remain capable of providing for the safety, permanency and well-being of the children placed in their care and continue to serve children in accordance with DCS Policies and Procedures.",
    tags: [
      "foster home responsibilities",
      "ICPC",
      "compliance",
      "safety",
      "permanency",
      "well-being",
      "foster parent duties",
    ],
  },
  {
    id: "16.9",
    title: "Required Foster Parent In-Service Training",
    chapter: "Foster Care",
    chapterNum: "16",
    description:
      "Training requirements for foster parents to maintain qualifications and competency",
    summary:
      "Foster Parents receive in-service training in accordance with DCS policies, Council on Accreditation (COA) standards, other accrediting entities, State and Federal laws, rules, and regulations. Ensures DCS and contract agencies maintain highly qualified and competent foster parents who are equipped to provide for the safety, permanency and well-being of the children placed in their care.",
    tags: [
      "training",
      "in-service",
      "foster parent",
      "COA",
      "accreditation",
      "competency",
      "continuing education",
    ],
  },
  {
    id: "16.11",
    title: "Shared Foster Homes",
    chapter: "Foster Care",
    chapterNum: "16",
    description:
      "Guidelines for DCS and contract providers to share foster homes for children in state custody",
    summary:
      "DCS and active Contract Providers may agree to share foster homes for children in state custody. Tennessee foster homes identified through the Interstate Compact on the Placement of Children (ICPC) process may serve as proposed placements for children in other states. Provides guidelines and establishes collaborative processes that enable custodial children and siblings to stay together and remain in a safe and nurturing home.",
    tags: [
      "shared foster homes",
      "contract providers",
      "ICPC",
      "sibling placement",
      "collaboration",
      "interstate",
    ],
  },
];

export function searchDCS(query: string): DCSPolicy[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return dcsPolicies
    .map((policy) => {
      let score = 0;
      if (policy.id.toLowerCase() === q) score += 100;
      else if (policy.id.toLowerCase().includes(q)) score += 50;
      if (policy.title.toLowerCase().includes(q)) score += 30;
      for (const tag of policy.tags) {
        if (tag.toLowerCase().includes(q)) score += 20;
        if (q.includes(tag.toLowerCase())) score += 15;
      }
      if (policy.description.toLowerCase().includes(q)) score += 10;
      const words = q.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue;
        if (policy.summary.toLowerCase().includes(word)) score += 5;
        if (policy.title.toLowerCase().includes(word)) score += 8;
      }
      return { policy, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.policy);
}
