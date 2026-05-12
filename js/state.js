/**
 * js/state.js -- GRC Command Center
 *
 * Shared application state and constants.
 * Loaded first -- all other modules depend on these globals.
 */

// ── Data stores ──────────────────────────────────────────
let controls = [

  // ── Access Control (UAM) ────────────────────────────
  { id:'UAM-001', name:'Multi-Factor Authentication', domain:'Access Control', validationDate:'2026-12-31', frequency:'Quarterly', owner:'IT Security Team', status:'Compliant', description:'Enforce MFA for all user accounts accessing critical systems and applications.', attachmentRequired:'Yes', attachments:[] },
  { id:'UAM-002', name:'Role-Based Access Control', domain:'Access Control', validationDate:'2026-09-30', frequency:'Semi-Annual', owner:'IT Security Team', status:'Compliant', description:'Ensure all system access is granted based on job roles and least-privilege principles.', attachmentRequired:'No', attachments:[] },
  { id:'UAM-003', name:'Privileged Access Management', domain:'Access Control', validationDate:'2026-07-31', frequency:'Quarterly', owner:'Security Operations', status:'Approaching Overdue', description:'Control and monitor the use of privileged accounts across all critical infrastructure.', attachmentRequired:'No', attachments:[] },
  { id:'UAM-004', name:'Password Policy Enforcement', domain:'Access Control', validationDate:'2025-03-01', frequency:'Monthly', owner:'IT Helpdesk', status:'Overdue', description:'Enforce minimum password complexity, length, and rotation requirements across all systems.', attachmentRequired:'No', attachments:[] },
  { id:'UAM-005', name:'User Access Reviews', domain:'Access Control', validationDate:'2026-06-30', frequency:'Annual', owner:'IT Security Team', status:'Not Assessed', description:'Conduct periodic reviews to ensure user access rights remain appropriate to current roles.', attachmentRequired:'No', attachments:[] },

  // ── Server Management (SRV) ─────────────────────────
  { id:'SRV-001', name:'Patch Management Policy', domain:'Server Management', validationDate:'2025-09-30', frequency:'Monthly', owner:'IT Operations', status:'Overdue', description:'Critical patches must be applied within 30 days of release. Several servers are currently overdue.', attachmentRequired:'Yes', attachments:[] },
  { id:'SRV-002', name:'Server Hardening Standards', domain:'Server Management', validationDate:'2026-11-30', frequency:'Annual', owner:'Infrastructure Team', status:'Compliant', description:'Apply CIS benchmark hardening configurations to all production and staging servers.', attachmentRequired:'No', attachments:[] },
  { id:'SRV-003', name:'OS Patching Compliance', domain:'Server Management', validationDate:'2025-04-15', frequency:'Monthly', owner:'IT Operations', status:'Overdue', description:'Operating system patches must be reviewed and applied within defined SLA windows.', attachmentRequired:'No', attachments:[] },
  { id:'SRV-004', name:'Server Access Logging', domain:'Server Management', validationDate:'2026-08-31', frequency:'Quarterly', owner:'Security Operations', status:'Approaching Overdue', description:'All server access events must be logged and retained for a minimum of 90 days.', attachmentRequired:'No', attachments:[] },
  { id:'SRV-005', name:'End-of-Life Server Decommission', domain:'Server Management', validationDate:'2026-10-31', frequency:'Semi-Annual', owner:'IT Operations', status:'Not Assessed', description:'Identify and decommission servers running end-of-life operating systems or software.', attachmentRequired:'No', attachments:[] },

  // ── Vulnerability Management (VM) ───────────────────
  { id:'VM-001', name:'Vulnerability Scanning', domain:'Vulnerability Management', validationDate:'2025-10-15', frequency:'Monthly', owner:'Security Operations', status:'Approaching Overdue', description:'Regular automated vulnerability scans across all endpoints and servers.', attachmentRequired:'No', attachments:[] },
  { id:'VM-002', name:'Penetration Testing', domain:'Vulnerability Management', validationDate:'2026-09-01', frequency:'Annual', owner:'Security Operations', status:'Approaching Overdue', description:'Annual third-party penetration testing of all externally-facing systems and applications.', attachmentRequired:'Yes', attachments:[] },
  { id:'VM-003', name:'CVE Remediation Tracking', domain:'Vulnerability Management', validationDate:'2025-02-28', frequency:'Monthly', owner:'Security Operations', status:'Overdue', description:'Track and remediate Common Vulnerabilities and Exposures within defined SLA timelines.', attachmentRequired:'No', attachments:[] },
  { id:'VM-004', name:'Risk-Based Patch Prioritization', domain:'Vulnerability Management', validationDate:'2026-07-15', frequency:'Quarterly', owner:'IT Security Team', status:'Compliant', description:'Prioritize patching activities based on CVSS scores and asset criticality ratings.', attachmentRequired:'No', attachments:[] },

  // ── Messaging and Collaboration (MC) ────────────────
  { id:'MC-001', name:'Email Security Gateway', domain:'Messaging and Collaboration', validationDate:'2026-08-31', frequency:'Quarterly', owner:'IT Security Team', status:'Compliant', description:'Maintain and configure email security gateway to filter spam, phishing, and malware.', attachmentRequired:'No', attachments:[] },
  { id:'MC-002', name:'Collaboration Tool Access Control', domain:'Messaging and Collaboration', validationDate:'2026-09-30', frequency:'Semi-Annual', owner:'IT Operations', status:'Approaching Overdue', description:'Enforce access controls and data sharing restrictions within collaboration platforms.', attachmentRequired:'No', attachments:[] },
  { id:'MC-003', name:'Data Loss Prevention for Email', domain:'Messaging and Collaboration', validationDate:'2025-05-01', frequency:'Monthly', owner:'Security Operations', status:'Overdue', description:'Implement DLP policies to prevent sensitive data from being transmitted via email.', attachmentRequired:'No', attachments:[] },
  { id:'MC-004', name:'Phishing Simulation Program', domain:'Messaging and Collaboration', validationDate:'2026-06-30', frequency:'Quarterly', owner:'IT Security Team', status:'Not Assessed', description:'Conduct regular simulated phishing campaigns to assess and improve staff awareness.', attachmentRequired:'Yes', attachments:[] },

  // ── Network Security (NS) ────────────────────────────
  { id:'NS-001', name:'Firewall Rule Review', domain:'Network Security', validationDate:'2025-11-30', frequency:'Semi-Annual', owner:'Network Team', status:'Compliant', description:'Periodic review of firewall rules to ensure only authorized traffic is permitted.', attachmentRequired:'No', attachments:[] },
  { id:'NS-002', name:'Network Segmentation', domain:'Network Security', validationDate:'2026-11-01', frequency:'Annual', owner:'Network Team', status:'Compliant', description:'Enforce network segmentation to isolate critical assets and limit lateral movement.', attachmentRequired:'No', attachments:[] },
  { id:'NS-003', name:'Intrusion Detection System', domain:'Network Security', validationDate:'2026-07-31', frequency:'Monthly', owner:'Security Operations', status:'Approaching Overdue', description:'Maintain and tune IDS/IPS rules to detect and alert on suspicious network activity.', attachmentRequired:'No', attachments:[] },
  { id:'NS-004', name:'VPN Access Policy', domain:'Network Security', validationDate:'2025-01-15', frequency:'Quarterly', owner:'IT Security Team', status:'Overdue', description:'Enforce VPN usage policies for all remote access to internal systems and resources.', attachmentRequired:'No', attachments:[] },

  // ── Vendor Management (VND) ──────────────────────────
  { id:'VND-001', name:'Third-Party Risk Assessment', domain:'Vendor Management', validationDate:'2025-06-30', frequency:'Annual', owner:'Procurement Team', status:'Overdue', description:'Conduct risk assessments for all critical third-party vendors before onboarding.', attachmentRequired:'Yes', attachments:[] },
  { id:'VND-002', name:'Vendor Contract Review', domain:'Vendor Management', validationDate:'2026-10-31', frequency:'Annual', owner:'Legal Team', status:'Approaching Overdue', description:'Review vendor contracts to ensure data protection and security clauses are current.', attachmentRequired:'Yes', attachments:[] },
  { id:'VND-003', name:'Supplier Security Questionnaire', domain:'Vendor Management', validationDate:'2026-09-30', frequency:'Annual', owner:'Procurement Team', status:'Not Assessed', description:'Issue and evaluate security questionnaires to all Tier 1 and Tier 2 suppliers annually.', attachmentRequired:'No', attachments:[] },

  // ── Mobile Device Management (MDM) ───────────────────
  { id:'MDM-001', name:'Mobile Device Enrollment Policy', domain:'Mobile Device Management', validationDate:'2026-08-31', frequency:'Quarterly', owner:'IT Operations', status:'Compliant', description:'All corporate mobile devices must be enrolled in the MDM platform before use.', attachmentRequired:'No', attachments:[] },
  { id:'MDM-002', name:'Remote Wipe Capability', domain:'Mobile Device Management', validationDate:'2026-07-31', frequency:'Semi-Annual', owner:'IT Security Team', status:'Approaching Overdue', description:'Ensure remote wipe capability is enabled and tested for all enrolled mobile devices.', attachmentRequired:'No', attachments:[] },
  { id:'MDM-003', name:'Mobile App Allowlisting', domain:'Mobile Device Management', validationDate:'2025-03-31', frequency:'Monthly', owner:'IT Security Team', status:'Overdue', description:'Only approved applications from the corporate allowlist may be installed on managed devices.', attachmentRequired:'No', attachments:[] },

  // ── Workstation Management (WM) ──────────────────────
  { id:'WM-001', name:'Workstation Encryption', domain:'Workstation Management', validationDate:'2026-12-01', frequency:'Annual', owner:'IT Operations', status:'Compliant', description:'Full-disk encryption must be enabled on all corporate laptops and workstations.', attachmentRequired:'No', attachments:[] },
  { id:'WM-002', name:'Software Inventory Management', domain:'Workstation Management', validationDate:'2025-07-31', frequency:'Quarterly', owner:'IT Operations', status:'Overdue', description:'Maintain an up-to-date inventory of all software installed on corporate endpoints.', attachmentRequired:'No', attachments:[] },
  { id:'WM-003', name:'USB Port Control Policy', domain:'Workstation Management', validationDate:'2026-09-15', frequency:'Semi-Annual', owner:'IT Security Team', status:'Approaching Overdue', description:'Restrict USB port usage to authorized devices only via endpoint management tools.', attachmentRequired:'No', attachments:[] },

  // ── Infrastructure Monitoring (IM) ───────────────────
  { id:'IM-001', name:'SIEM Implementation', domain:'Infrastructure Monitoring', validationDate:'2026-10-31', frequency:'Monthly', owner:'Security Operations', status:'Compliant', description:'Operate a centralized SIEM platform for real-time event correlation and alerting.', attachmentRequired:'No', attachments:[] },
  { id:'IM-002', name:'Log Retention Policy', domain:'Infrastructure Monitoring', validationDate:'2026-08-01', frequency:'Quarterly', owner:'Security Operations', status:'Approaching Overdue', description:'Retain security logs for a minimum of 12 months in compliance with regulatory requirements.', attachmentRequired:'No', attachments:[] },
  { id:'IM-003', name:'Uptime and Availability Monitoring', domain:'Infrastructure Monitoring', validationDate:'2026-11-30', frequency:'Monthly', owner:'Infrastructure Team', status:'Compliant', description:'Monitor uptime and availability of all Tier 1 systems with automated alerting.', attachmentRequired:'No', attachments:[] },
  { id:'IM-004', name:'Alert Triage Procedures', domain:'Infrastructure Monitoring', validationDate:'2026-07-01', frequency:'Quarterly', owner:'Security Operations', status:'Not Assessed', description:'Define and maintain documented procedures for triaging and escalating security alerts.', attachmentRequired:'No', attachments:[] },

  // ── Database Management (DB) ─────────────────────────
  { id:'DB-001', name:'Database Access Control', domain:'Database Management', validationDate:'2025-08-15', frequency:'Quarterly', owner:'Database Team', status:'Overdue', description:'Restrict database access to authorized personnel and applications only.', attachmentRequired:'No', attachments:[] },
  { id:'DB-002', name:'Database Encryption at Rest', domain:'Database Management', validationDate:'2026-10-01', frequency:'Annual', owner:'Database Team', status:'Approaching Overdue', description:'Ensure all databases containing sensitive data are encrypted at rest using AES-256.', attachmentRequired:'No', attachments:[] },
  { id:'DB-003', name:'Database Activity Monitoring', domain:'Database Management', validationDate:'2026-06-30', frequency:'Monthly', owner:'Security Operations', status:'Not Assessed', description:'Deploy database activity monitoring to detect unauthorized queries and access attempts.', attachmentRequired:'No', attachments:[] },

  // ── Antivirus Management (AV) ────────────────────────
  { id:'AV-001', name:'Endpoint Antivirus Coverage', domain:'Antivirus Management', validationDate:'2025-10-01', frequency:'Monthly', owner:'IT Security Team', status:'Overdue', description:'Antivirus definitions on several workstations are out of date and require immediate update.', attachmentRequired:'No', attachments:[] },
  { id:'AV-002', name:'Malware Incident Response', domain:'Antivirus Management', validationDate:'2026-08-31', frequency:'Quarterly', owner:'Security Operations', status:'Approaching Overdue', description:'Maintain and test a documented malware incident response playbook.', attachmentRequired:'No', attachments:[] },
  { id:'AV-003', name:'Antivirus Policy Compliance', domain:'Antivirus Management', validationDate:'2025-04-01', frequency:'Monthly', owner:'IT Security Team', status:'Overdue', description:'Ensure 100% of managed endpoints are covered by an active antivirus solution.', attachmentRequired:'No', attachments:[] },

  // ── Backup & Storage (BS) ────────────────────────────
  { id:'BS-001', name:'Backup & Recovery Testing', domain:'Backup & Storage', validationDate:'2025-08-31', frequency:'Quarterly', owner:'Infrastructure Team', status:'Overdue', description:'Quarterly backup restoration tests have not been completed for the past two cycles.', attachmentRequired:'Yes', attachments:[] },
  { id:'BS-002', name:'Offsite Backup Verification', domain:'Backup & Storage', validationDate:'2025-05-30', frequency:'Quarterly', owner:'Infrastructure Team', status:'Overdue', description:'Verify offsite and cloud backup integrity monthly to ensure recoverability.', attachmentRequired:'No', attachments:[] },
  { id:'BS-003', name:'Data Retention Policy', domain:'Backup & Storage', validationDate:'2026-12-31', frequency:'Annual', owner:'Compliance Team', status:'Compliant', description:'Enforce data retention schedules in line with legal, regulatory, and business requirements.', attachmentRequired:'No', attachments:[] },

  // ── Cloud (CLD) ──────────────────────────────────────
  { id:'CLD-001', name:'Cloud Security Posture Management', domain:'Cloud', validationDate:'2025-02-28', frequency:'Monthly', owner:'Cloud Team', status:'Overdue', description:'Continuously assess and remediate cloud resource misconfigurations using CSPM tooling.', attachmentRequired:'No', attachments:[] },
  { id:'CLD-002', name:'Cloud Access Security Broker', domain:'Cloud', validationDate:'2026-09-30', frequency:'Quarterly', owner:'IT Security Team', status:'Approaching Overdue', description:'Deploy CASB to enforce security policies for cloud service usage across the organization.', attachmentRequired:'Yes', attachments:[] },
  { id:'CLD-003', name:'Cloud Data Encryption Policy', domain:'Cloud', validationDate:'2026-11-30', frequency:'Annual', owner:'Cloud Team', status:'Compliant', description:'Ensure all data stored in cloud environments is encrypted in transit and at rest.', attachmentRequired:'No', attachments:[] },
  { id:'CLD-004', name:'Cloud Identity and Access Management', domain:'Cloud', validationDate:'2026-06-30', frequency:'Quarterly', owner:'IT Security Team', status:'Not Assessed', description:'Enforce IAM policies across all cloud accounts including MFA and least-privilege roles.', attachmentRequired:'No', attachments:[] },
];

let risks = [
  { id:'RSK-001', title:'Unauthorized Access to Systems', category:'Technology', impact:'High', likelihood:'High', level:'Critical', owner:'CISO', treatment:'Mitigate', controls:['UAM-001','UAM-002','UAM-003'], riskStatus:'Pending Approval', description:'Risk of unauthorized users gaining access to critical systems due to weak authentication controls.' },
  { id:'RSK-002', title:'Phishing Attack', category:'Technology', impact:'High', likelihood:'Very High', level:'Critical', owner:'Security Operations', treatment:'Mitigate', controls:['MC-001','MC-004','UAM-001'], riskStatus:'Action Plan In Progress', description:'Employees may be targeted by phishing emails leading to credential theft or malware installation.' },
  { id:'RSK-003', title:'Unpatched Vulnerabilities', category:'Technology', impact:'High', likelihood:'High', level:'Critical', owner:'IT Operations', treatment:'Mitigate', controls:['VM-001','VM-003','SRV-003'], riskStatus:'Accepted', description:'Delayed patching exposes systems to exploitation of known vulnerabilities.' },
  { id:'RSK-004', title:'Data Breach', category:'Compliance', impact:'Very High', likelihood:'Medium', level:'Critical', owner:'CISO', treatment:'Mitigate', controls:['UAM-001','DB-001','CLD-003'], riskStatus:'Closed', description:'Sensitive customer or employee data may be exposed due to inadequate access and encryption controls.' },
  { id:'RSK-005', title:'Ransomware Attack', category:'Operational', impact:'Very High', likelihood:'Medium', level:'Critical', owner:'CISO', treatment:'Mitigate', controls:['AV-001','BS-001','VM-001'], riskStatus:'Open', description:'Ransomware infection could encrypt business-critical data and cause significant operational downtime.' },
  { id:'RSK-006', title:'Insider Threat', category:'Operational', impact:'High', likelihood:'Medium', level:'High', owner:'HR & Security', treatment:'Mitigate', controls:['UAM-002','UAM-003','IM-001'], riskStatus:'Pending Approval', description:'Malicious or negligent insiders may exfiltrate data or sabotage systems.' },
  { id:'RSK-007', title:'Third-Party Vendor Risk', category:'Compliance', impact:'High', likelihood:'High', level:'Critical', owner:'Procurement Team', treatment:'Transfer', controls:['VND-001','VND-002','VND-003'], riskStatus:'Action Plan In Progress', description:'Vendors with inadequate security controls may introduce risk into the supply chain.' },
  { id:'RSK-008', title:'Cloud Misconfiguration', category:'Technology', impact:'High', likelihood:'High', level:'Critical', owner:'Cloud Team', treatment:'Mitigate', controls:['CLD-001','CLD-002','CLD-004'], riskStatus:'Accepted', description:'Improperly configured cloud resources may expose sensitive data or services to the public internet.' },
  { id:'RSK-009', title:'Network Intrusion', category:'Technology', impact:'High', likelihood:'Medium', level:'High', owner:'Network Team', treatment:'Mitigate', controls:['NS-001','NS-002','NS-003'], riskStatus:'Closed', description:'Unauthorized actors may penetrate the network perimeter and move laterally to critical assets.' },
  { id:'RSK-010', title:'Data Loss', category:'Operational', impact:'Very High', likelihood:'Low', level:'High', owner:'Infrastructure Team', treatment:'Mitigate', controls:['BS-001','BS-002','CLD-003'], riskStatus:'Open', description:'Accidental deletion or hardware failure may result in permanent loss of critical business data.' },
  { id:'RSK-011', title:'Weak Password Policy', category:'Compliance', impact:'Medium', likelihood:'High', level:'High', owner:'IT Helpdesk', treatment:'Mitigate', controls:['UAM-004','UAM-001'], riskStatus:'Pending Approval', description:'Weak or reused passwords increase risk of account compromise through brute force or credential stuffing.' },
  { id:'RSK-012', title:'Mobile Device Loss or Theft', category:'Operational', impact:'Medium', likelihood:'Medium', level:'Medium', owner:'IT Operations', treatment:'Mitigate', controls:['MDM-001','MDM-002'], riskStatus:'Action Plan In Progress', description:'Lost or stolen corporate mobile devices may expose sensitive organizational data.' },
  { id:'RSK-013', title:'Software Vulnerabilities', category:'Technology', impact:'High', likelihood:'High', level:'Critical', owner:'Security Operations', treatment:'Mitigate', controls:['VM-002','VM-003','SRV-003'], riskStatus:'Accepted', description:'Vulnerabilities in third-party or custom software may be exploited to compromise systems.' },
  { id:'RSK-014', title:'Regulatory Non-Compliance', category:'Compliance', impact:'Very High', likelihood:'Medium', level:'Critical', owner:'Compliance Team', treatment:'Mitigate', controls:['UAM-005','VND-001','DB-001'], riskStatus:'Closed', description:'Failure to meet regulatory requirements may result in fines, sanctions, or reputational damage.' },
  { id:'RSK-015', title:'System Downtime', category:'Operational', impact:'High', likelihood:'Medium', level:'High', owner:'Infrastructure Team', treatment:'Mitigate', controls:['IM-003','BS-001','SRV-002'], riskStatus:'Open', description:'Unplanned system outages may disrupt business operations and result in financial losses.' },
  { id:'RSK-016', title:'Unauthorized Database Access', category:'Compliance', impact:'High', likelihood:'Medium', level:'High', owner:'Database Team', treatment:'Mitigate', controls:['DB-001','DB-002','UAM-002'], riskStatus:'Pending Approval', description:'Unauthorized access to databases may expose sensitive records and violate data protection laws.' },
  { id:'RSK-017', title:'Insufficient Security Logging', category:'Compliance', impact:'Medium', likelihood:'Medium', level:'Medium', owner:'Security Operations', treatment:'Mitigate', controls:['IM-001','IM-002','SRV-004'], riskStatus:'Action Plan In Progress', description:'Gaps in security logging may prevent detection of incidents and hinder forensic investigations.' },
  { id:'RSK-018', title:'Legacy System Risk', category:'Technology', impact:'High', likelihood:'High', level:'Critical', owner:'IT Operations', treatment:'Avoid', controls:['SRV-005','VM-004','WM-002'], riskStatus:'Accepted', description:'Outdated systems running end-of-life software no longer receive security updates, posing significant risk.' },
  { id:'RSK-019', title:'Social Engineering Attack', category:'Operational', impact:'High', likelihood:'High', level:'Critical', owner:'Security Operations', treatment:'Mitigate', controls:['MC-004','UAM-001','UAM-004'], riskStatus:'Closed', description:'Attackers may manipulate employees into divulging credentials or granting unauthorized access.' },
  { id:'RSK-020', title:'Supply Chain Attack', category:'Strategic', impact:'Very High', likelihood:'Low', level:'High', owner:'CISO', treatment:'Mitigate', controls:['VND-001','VND-002','VND-003'], riskStatus:'Open', description:'Compromise of a trusted supplier or software vendor could introduce backdoors or malicious code.' },
  { id:'RSK-021', title:'Endpoint Compromise', category:'Technology', impact:'High', likelihood:'Medium', level:'High', owner:'IT Security Team', treatment:'Mitigate', controls:['AV-001','WM-001','MDM-003'], riskStatus:'Pending Approval', description:'Corporate endpoints may be compromised through malware, leading to data exfiltration or lateral movement.' },
  { id:'RSK-022', title:'Business Email Compromise', category:'Technology', impact:'High', likelihood:'High', level:'Critical', owner:'Security Operations', treatment:'Mitigate', controls:['MC-001','MC-003','UAM-004'], riskStatus:'Action Plan In Progress', description:'Attackers may impersonate executives or vendors via email to initiate fraudulent transactions.' },
  { id:'RSK-023', title:'Excessive User Privileges', category:'Compliance', impact:'Medium', likelihood:'High', level:'High', owner:'IT Security Team', treatment:'Mitigate', controls:['UAM-002','UAM-003','UAM-005'], riskStatus:'Accepted', description:'Users with more access than required by their role create unnecessary risk of data misuse.' },
  { id:'RSK-024', title:'Cloud Data Exposure', category:'Technology', impact:'Very High', likelihood:'Medium', level:'Critical', owner:'Cloud Team', treatment:'Mitigate', controls:['CLD-001','CLD-003','DB-002'], riskStatus:'Closed', description:'Publicly accessible cloud storage or misconfigured services may expose sensitive data.' },
  { id:'RSK-025', title:'Application Security Flaws', category:'Technology', impact:'High', likelihood:'Medium', level:'High', owner:'Security Operations', treatment:'Mitigate', controls:['VM-002','VM-003'], riskStatus:'Open', description:'Security vulnerabilities in custom applications may be exploited by attackers to gain unauthorized access.' },
  { id:'RSK-026', title:'DDoS Attack', category:'Operational', impact:'High', likelihood:'Low', level:'Medium', owner:'Network Team', treatment:'Transfer', controls:['NS-003','NS-004','IM-003'], riskStatus:'Pending Approval', description:'Distributed denial-of-service attacks may render public-facing services unavailable.' },
  { id:'RSK-027', title:'Backup Failure', category:'Operational', impact:'High', likelihood:'Medium', level:'High', owner:'Infrastructure Team', treatment:'Mitigate', controls:['BS-001','BS-002','BS-003'], riskStatus:'Action Plan In Progress', description:'Backup jobs may silently fail, leaving the organization unable to recover data after an incident.' },
  { id:'RSK-028', title:'Audit Failure', category:'Compliance', impact:'High', likelihood:'Low', level:'Medium', owner:'Compliance Team', treatment:'Mitigate', controls:['UAM-005','IM-002','DB-003'], riskStatus:'Accepted', description:'Inability to produce audit evidence may result in compliance failures or regulatory findings.' },
  { id:'RSK-029', title:'Cryptographic Key Exposure', category:'Technology', impact:'Very High', likelihood:'Low', level:'High', owner:'IT Security Team', treatment:'Mitigate', controls:['DB-002','CLD-003','WM-001'], riskStatus:'Closed', description:'Poorly managed encryption keys may be exposed, compromising all data protected by those keys.' },
  { id:'RSK-030', title:'Removable Media Risk', category:'Operational', impact:'Medium', likelihood:'High', level:'High', owner:'IT Security Team', treatment:'Mitigate', controls:['WM-003','MDM-003'], riskStatus:'Open', description:'Use of unauthorized USB drives or removable media may introduce malware or facilitate data theft.' },
  { id:'RSK-031', title:'Firewall Misconfiguration', category:'Technology', impact:'High', likelihood:'Medium', level:'High', owner:'Network Team', treatment:'Mitigate', controls:['NS-001','NS-002'], riskStatus:'Pending Approval', description:'Incorrectly configured firewall rules may inadvertently allow unauthorized network traffic.' },
  { id:'RSK-032', title:'Financial Fraud', category:'Financial', impact:'Very High', likelihood:'Low', level:'High', owner:'Finance & Security', treatment:'Mitigate', controls:['UAM-003','DB-001','IM-001'], riskStatus:'Action Plan In Progress', description:'Fraudulent transactions may occur due to inadequate controls over financial systems and privileged access.' },
  { id:'RSK-033', title:'IT Asset Sprawl', category:'Operational', impact:'Medium', likelihood:'Medium', level:'Medium', owner:'IT Operations', treatment:'Mitigate', controls:['WM-002','CLD-004','MDM-001'], riskStatus:'Accepted', description:'Unmanaged or unknown assets may bypass security controls and create unmonitored attack surfaces.' },
  { id:'RSK-034', title:'Identity Theft', category:'Compliance', impact:'High', likelihood:'Medium', level:'High', owner:'CISO', treatment:'Mitigate', controls:['UAM-001','UAM-004','MC-003'], riskStatus:'Closed', description:'Employee or customer identities may be stolen through phishing or data breaches.' },
  { id:'RSK-035', title:'Third-Party Software Vulnerabilities', category:'Technology', impact:'High', likelihood:'High', level:'Critical', owner:'Security Operations', treatment:'Mitigate', controls:['VM-001','VM-004','VND-002'], riskStatus:'Open', description:'Vulnerabilities in third-party libraries or software components may be exploited by attackers.' },
  { id:'RSK-036', title:'Inadequate Incident Response', category:'Operational', impact:'High', likelihood:'Medium', level:'High', owner:'Security Operations', treatment:'Mitigate', controls:['AV-002','IM-001','BS-001'], riskStatus:'Pending Approval', description:'Lack of a tested incident response plan may increase recovery time and damage from security incidents.' },
  { id:'RSK-037', title:'Data Sovereignty Risk', category:'Compliance', impact:'High', likelihood:'Low', level:'Medium', owner:'Compliance Team', treatment:'Mitigate', controls:['CLD-001','CLD-002','BS-003'], riskStatus:'Action Plan In Progress', description:'Data stored in foreign cloud regions may violate local data sovereignty regulations.' },
  { id:'RSK-038', title:'Network Eavesdropping', category:'Technology', impact:'High', likelihood:'Low', level:'Medium', owner:'Network Team', treatment:'Mitigate', controls:['NS-002','NS-004','WM-001'], riskStatus:'Accepted', description:'Attackers may intercept unencrypted network traffic to steal credentials or sensitive data.' },
  { id:'RSK-039', title:'Privileged Account Abuse', category:'Compliance', impact:'Very High', likelihood:'Low', level:'High', owner:'IT Security Team', treatment:'Mitigate', controls:['UAM-003','IM-001','DB-003'], riskStatus:'Closed', description:'Misuse of privileged accounts may lead to unauthorized data access or system configuration changes.' },
  { id:'RSK-040', title:'Malware Distribution', category:'Technology', impact:'High', likelihood:'Medium', level:'High', owner:'Security Operations', treatment:'Mitigate', controls:['AV-001','AV-003','MC-001'], riskStatus:'Open', description:'Malware may spread across corporate systems through email attachments or compromised endpoints.' },
  { id:'RSK-041', title:'Reputational Damage', category:'Strategic', impact:'Very High', likelihood:'Low', level:'High', owner:'CISO', treatment:'Mitigate', controls:['UAM-001','VND-001','MC-004'], riskStatus:'Pending Approval', description:'A publicized security incident may severely damage the organization\'s brand and customer trust.' },
  { id:'RSK-042', title:'Business Continuity Failure', category:'Strategic', impact:'Very High', likelihood:'Medium', level:'Critical', owner:'CISO', treatment:'Mitigate', controls:['BS-001','BS-002','IM-003'], riskStatus:'Action Plan In Progress', description:'Absence of a tested business continuity plan may prevent recovery from a major disruptive event.' },
];

let riskSeq = 43;

// ── Domain -> ID prefix mapping ──────────────────────────
const DOMAIN_PREFIX = {
  'Access Control':              'UAM',
  'Server Management':           'SRV',
  'Vulnerability Management':    'VM',
  'Messaging and Collaboration': 'MC',
  'Network Security':            'NS',
  'Vendor Management':           'VND',
  'Mobile Device Management':    'MDM',
  'Workstation Management':      'WM',
  'Infrastructure Monitoring':   'IM',
  'Database Management':         'DB',
  'Antivirus Management':        'AV',
  'Backup & Storage':            'BS',
  'Cloud':                       'CLD',
};

// Per-domain sequence counters (pre-seeded to match predefined controls)
const domainSeq = {
  UAM: 5, SRV: 5, VM: 4, MC: 4, NS: 4,
  VND: 3, MDM: 3, WM: 3, IM: 4, DB: 3,
  AV: 3, BS: 3, CLD: 4,
};

/**
 * Generate the next sequential control ID for a given domain.
 * e.g. "UAM-006", "SRV-006"
 */
function nextCtrlId(domain) {
  const prefix = DOMAIN_PREFIX[domain] || 'CTL';
  domainSeq[prefix] = (domainSeq[prefix] || 0) + 1;
  return prefix + '-' + String(domainSeq[prefix]).padStart(3, '0');
}

// ── Status pill HTML snippets ────────────────────────────
// Pills are used in drawers (detail view) — keep pill styling there
const ctrlPill = {
  'Compliant':          '<span class="pill pill-green">Compliant</span>',
  'Approaching Overdue':'<span class="pill pill-yellow">Approaching Overdue</span>',
  'Overdue':            '<span class="pill pill-red">Overdue</span>',
  'Not Assessed':       '<span class="pill pill-black">Not Assessed</span>',
  'Out of Scope':       '<span class="pill pill-gray">Out of Scope</span>',
};

// Table-only plain colored text (no pill background/border)
const ctrlStatusText = {
  'Compliant':          '<span class="status-text status-text-green">Compliant</span>',
  'Approaching Overdue':'<span class="status-text status-text-yellow">Approaching Overdue</span>',
  'Overdue':            '<span class="status-text status-text-red">Overdue</span>',
  'Not Assessed':       '<span class="status-text status-text-muted">Not Assessed</span>',
  'Out of Scope':       '<span class="status-text status-text-gray">Out of Scope</span>',
};

const riskPill = {
  'Critical': '<span class="pill pill-red">Critical</span>',
  'High':     '<span class="pill pill-red">High</span>',
  'Medium':   '<span class="pill pill-yellow">Medium</span>',
  'Low':      '<span class="pill pill-blue">Low</span>',
};

// Table-only plain colored text for risk level
const riskLevelText = {
  'Critical': '<span class="status-text status-text-red">Critical</span>',
  'High':     '<span class="status-text status-text-orange">High</span>',
  'Medium':   '<span class="status-text status-text-yellow">Medium</span>',
  'Low':      '<span class="status-text status-text-blue">Low</span>',
};

const riskStatusPill = {
  'Open':                     '<span class="pill pill-red">Open</span>',
  'Pending Approval':         '<span class="pill pill-yellow">Pending Approval</span>',
  'Action Plan In Progress':  '<span class="pill pill-blue">Action Plan In Progress</span>',
  'Accepted':                 '<span class="pill pill-purple">Accepted</span>',
  'Closed':                   '<span class="pill pill-green">Closed</span>',
};

// Table-only plain colored text for risk status
const riskStatusText = {
  'Open':                    '<span class="status-text status-text-red">Open</span>',
  'Pending Approval':        '<span class="status-text status-text-yellow">Pending Approval</span>',
  'Action Plan In Progress': '<span class="status-text status-text-blue">Action Plan In Progress</span>',
  'Accepted':                '<span class="status-text status-text-purple">Accepted</span>',
  'Closed':                  '<span class="status-text status-text-green">Closed</span>',
};

// ── Utility: derive risk level from impact x likelihood ──
function deriveLevel(impact, likelihood) {
  const score = { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 };
  const s = score[impact] * score[likelihood];
  if (s >= 16) return 'Critical';
  if (s >= 9)  return 'High';
  if (s >= 4)  return 'Medium';
  return 'Low';
}

// ── Utility: format "YYYY-MM-DD" -> "Mon D, YYYY" ────────
function formatDate(dateStr) {
  if (!dateStr) return '--';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

// ── Utility: today as "YYYY-MM-DD" ──────────────────────
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Utility: flag overdue controls as Non-Compliant ──────
function applyOverdueStatuses() {
  const today = todayISO();
  const todayDate = new Date(today);
  controls.forEach(c => {
    if (!c.validationDate || c.status === 'Out of Scope' || c.status === 'Not Assessed') return;
    const valDate = new Date(c.validationDate);
    const daysUntil = Math.ceil((valDate - todayDate) / (1000*60*60*24));
    if (daysUntil < 0) {
      c.status = 'Overdue';
    } else if (daysUntil <= 30) {
      if (c.status !== 'Compliant') c.status = 'Approaching Overdue';
    }
  });
}