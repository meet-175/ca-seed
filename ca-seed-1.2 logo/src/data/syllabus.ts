export interface SyllabusSection {
  title: string;
  chapters: string[];
}

export interface SyllabusSubject {
  name: string;
  sections: SyllabusSection[];
}

export const SYLLABUS: Record<string, SyllabusSubject[]> = {
  'CA Foundation': [
    {
      name: 'Accounting',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Theoretical Framework',
            'Chapter 2: Accounting Process',
            'Chapter 3: Bank Reconciliation Statement',
            'Chapter 4: Inventories',
            'Chapter 5: Depreciation and Amortisation',
            'Chapter 6: Bills of Exchange and Promissory Notes',
            'Chapter 7: Preparation of Final Accounts of Sole Proprietors',
            'Chapter 8: Financial Statements of Not-for-Profit Organisations',
            'Chapter 9: Accounts from Incomplete Records',
            'Chapter 10: Partnership and LLP Accounts',
            'Chapter 11: Company Accounts'
          ]
        }
      ]
    },
    {
      name: 'Business Laws',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Indian Regulatory Framework',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 1: Nature of Contracts',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 2: Consideration',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 3: Other Essential Elements of a Contract',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 4: Performance of Contract',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 5: Breach of Contract and its Remedies',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 6: Contingent and Quasi Contracts',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 7: Contract of Indemnity and Guarantee',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 8: Bailment and Pledge',
            'Chapter 2: The Indian Contract Act, 1872 - Unit 9: Agency',
            'Chapter 3: The Sale of Goods Act, 1930',
            'Chapter 4: The Indian Partnership Act, 1932',
            'Chapter 5: The Limited Liability Partnership Act, 2008',
            'Chapter 6: The Companies Act, 2013',
            'Chapter 7: The Negotiable Instruments Act, 1881'
          ]
        }
      ]
    },
    {
      name: 'Quantitative Aptitude',
      sections: [
        {
          title: 'PART-A BUSINESS MATHEMATICS',
          chapters: [
            'Chapter 1: Ratio and Proportion, Indices, Logarithms',
            'Chapter 2: Equations',
            'Chapter 3: Linear Inequalities',
            'Chapter 4: Mathematics of Finance',
            'Chapter 5: Basic Concepts of Permutations and Combinations',
            'Chapter 6: Sequence and Series – Arithmetic and Geometric Progressions',
            'Chapter 7: Sets, Relations and Functions, Basics of Limits and Continuity functions',
            'Chapter 8: Basic Applications of Differential and Calculus in Business and Economics'
          ]
        },
        {
          title: 'PART-B LOGICAL REASONING',
          chapters: [
            'Chapter 9: Number Series, Coding and Decoding and Odd Man Out',
            'Chapter 10: Direction Sense Test',
            'Chapter 11: Seating Arrangements',
            'Chapter 12: Blood Relations'
          ]
        },
        {
          title: 'PART-C STATISTICS',
          chapters: [
            'Chapter 13: Introduction to Statistics',
            'Chapter 14: Measures of Central Tendency and Dispersion',
            'Chapter 15: Probability',
            'Chapter 16: Theoretical Distributions',
            'Chapter 17: Correlation and Regression',
            'Chapter 18: Index Numbers'
          ]
        }
      ]
    },
    {
      name: 'Business Economics',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Nature & Scope of Business Economics',
            'Chapter 2: Theory of Demand and Supply',
            'Chapter 3: Theory of Production and Cost',
            'Chapter 4: Price Determination in Different Markets',
            'Chapter 5: Business Cycles',
            'Chapter 6: Determination of National Income',
            'Chapter 7: Public Finance',
            'Chapter 8: Money Market',
            'Chapter 9: International Trade',
            'Chapter 10: Indian Economy'
          ]
        }
      ]
    }
  ],
  'CA Intermediate': [
    {
      name: 'Advanced Accounting',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Introduction to Accounting Standards',
            'Chapter 2: Framework for Preparation and Presentation of Financial Statements',
            'Chapter 3: Applicability of Accounting Standards',
            'Accounting Standard 1: Disclosure of Accounting Policies',
            'Accounting Standard 2: Valuation of Inventory',
            'Accounting Standard 3: Cash Flow Statement',
            'Accounting Standard 4: Contingencies and Events occurring after the Balance Sheet Date',
            'Accounting Standard 5: Net Profit or Loss for the Period, Prior Period Items and Changes in Accounting Policies',
            'Accounting Standard 7: Construction Contracts',
            'Accounting Standard 9: Revenue Recognition',
            'Accounting Standard 10: Property, Plant and Equipment',
            'Accounting Standard 11: The Effects of Changes in Foreign Exchange Rates',
            'Accounting Standard 12: Accounting for Government Grants',
            'Accounting Standard 13: Accounting for Investments',
            'Accounting Standard 14: Accounting for Amalgamations',
            'Accounting Standard 15: Employee Benefits',
            'Accounting Standard 16: Borrowing Costs',
            'Accounting Standard 17: Segment Reporting',
            'Accounting Standard 18: Related Party Disclosures',
            'Accounting Standard 19: Leases',
            'Accounting Standard 20: Earnings Per Share',
            'Accounting Standard 21: Consolidated Financial Statements',
            'Accounting Standard 22: Accounting for Taxes on Income',
            'Accounting Standard 23: Accounting for Investments in Associates in Consolidated Financial Statements',
            'Accounting Standard 24: Discontinuing Operations',
            'Accounting Standard 25: Interim Financial Reporting',
            'Accounting Standard 26: Intangible Assets',
            'Accounting Standard 27: Financial Reporting of Interests in Joint Ventures',
            'Accounting Standard 28: Impairment of Assets',
            'Accounting Standard 29 (Revised): Provisions, Contingent Liabilities and Contingent Assets',
            'Unit 1: Preparation of Financial Statements',
            'Unit 2: Cash Flow Statement',
            'Chapter 12: Buyback of Securities',
            'Chapter 13: Amalgamation of Companies',
            'Chapter 14: Internal Reconstruction',
            'Chapter 15: Accounting for Branches including Foreign Branches'
          ]
        }
      ]
    },
    {
      name: 'Corporate and Other Laws',
      sections: [
        {
          title: 'PART I – COMPANY LAW',
          chapters: [
            'Chapter 1: Preliminary',
            'Chapter 2: Incorporation of Company and Matters Incidental Thereto',
            'Chapter 3: Prospectus and Allotment of Securities',
            'Chapter 4: Share Capital and Debentures',
            'Chapter 5: Acceptance of Deposits by Companies',
            'Chapter 6: Registration of Charges',
            'Chapter 7: Management & Administration',
            'Chapter 8: Declaration and Payment of Dividend',
            'Chapter 9: Accounts of Companies',
            'Chapter 10: Audit and Auditors',
            'Chapter 11: Companies Incorporated Outside India',
            'Chapter 12: The Limited Liability Partnership Act, 2008'
          ]
        },
        {
          title: 'PART II – OTHER LAWS',
          chapters: [
            'Chapter 1: The General Clauses Act, 1897',
            'Chapter 2: Interpretation of Statutes',
            'Chapter 3: The Foreign Exchange Management Act, 1999'
          ]
        }
      ]
    },
    {
      name: 'Taxation',
      sections: [
        {
          title: 'SECTION A: INCOME TAX',
          chapters: [
            'Chapter 1: Basic Concepts',
            'Chapter 2: Residence and Scope of Total Income',
            'Unit 1: Salaries',
            'Unit 2: House Property',
            'Unit 3: PGBP',
            'Unit 4: Capital Gains',
            'Unit 5: Income from Other Sources',
            'Chapter 4: Income of Other Persons included in Assessee’s Total Income',
            'Chapter 5: Aggregation of Income, Set-Off and Carry Forward of Losses',
            'Chapter 6: Deductions from Gross Total Income',
            'Chapter 7: Advance Tax, Tax Deduction at Source and Tax Collection at Source',
            'Chapter 8: Provisions for Filing Return of Income and Self-Assessment',
            'Chapter 9: Income Tax Liability—Computation and Optimisation'
          ]
        },
        {
          title: 'SECTION B: GOOD AND SERVICE TAX',
          chapters: [
            'Chapter 1: GST in India - An Introduction',
            'Chapter 2: Supply under GST',
            'Chapter 3: Charge of GST',
            'Chapter 4: Place of Supply',
            'Chapter 5: Exemptions from GST',
            'Chapter 6: Time of Supply',
            'Chapter 7: Value of Supply',
            'Chapter 8: Input Tax Credit',
            'Chapter 9: Registration',
            'Chapter 10: Tax Invoice; Credit and Debit Notes',
            'Chapter 11: Accounts and Records',
            'Chapter 12: E-Way Bill',
            'Chapter 13: Payment of Tax',
            'Chapter 14: Tax Deduction at Source and Collection of Tax at Source',
            'Chapter 15: Returns'
          ]
        }
      ]
    },
    {
      name: 'Cost and Management Accounting',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Introduction to Cost and Management Accounting',
            'Chapter 2: Material Cost',
            'Chapter 3: Employee Cost and Direct Expenses',
            'Chapter 4: Overheads – Absorption Costing Method',
            'Chapter 5: Activity Based Costing',
            'Chapter 6: Cost Sheet',
            'Chapter 7: Cost Accounting Systems',
            'Chapter 8: Unit & Batch Costing',
            'Chapter 9: Job Costing',
            'Chapter 10: Process & Operation Costing',
            'Chapter 11: Joint Products and By Products',
            'Chapter 12: Service Costing',
            'Chapter 13: Standard Costing',
            'Chapter 14: Marginal Costing',
            'Chapter 15: Budgets and Budgetary Control'
          ]
        }
      ]
    },
    {
      name: 'Auditing and Ethics',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Nature, Objective and Scope of Audit',
            'Chapter 2: Audit Strategy, Audit Planning and Audit Programme',
            'Chapter 3: Risk Assessment and Internal Control',
            'Chapter 4: Audit Evidence',
            'Chapter 5: Audit of Items of Financial Statements',
            'Chapter 6: Audit Documentation',
            'Chapter 7: Completion and Review',
            'Chapter 8: Audit Report',
            'Chapter 9: Special Features of Audit of Different Type of Entities',
            'Chapter 10: Audit of Banks',
            'Chapter 11: Ethics and Terms of Audit Engagements'
          ]
        }
      ]
    },
    {
      name: 'Financial Management and Strategic Management',
      sections: [
        {
          title: 'SECTION A: FINANCIAL MANAGEMENT',
          chapters: [
            'Chapter 1: Scope and Objectives of Financial Management',
            'Chapter 2: Types of Financing',
            'Chapter 3: Financial Analysis and Planning—Ratio Analysis',
            'Chapter 4: Cost of Capital',
            'Chapter 5: Financing Decisions—Capital Structure',
            'Chapter 6: Financing Decisions—Leverages',
            'Chapter 7: Investment Decisions',
            'Chapter 8: Dividend Decision',
            'Chapter 9: Management of Working Capital'
          ]
        },
        {
          title: 'SECTION B: STRATEGIC MANAGEMENT',
          chapters: [
            'Chapter 1: Introduction to Strategic Management',
            'Chapter 2: Strategic Analysis: External Environment',
            'Chapter 3: Strategic Analysis: Internal Environment',
            'Chapter 4: Strategic Choices',
            'Chapter 5: Strategy Implementation and Evaluation'
          ]
        }
      ]
    }
  ],
  'CA Final': [
    {
      name: 'Financial Reporting',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Introduction to Indian Accounting Standards',
            'Chapter 2: Conceptual Framework for Financial Reporting under Ind AS',
            'Ind AS 1: Presentation of Financial Statements',
            'Ind AS 2: Inventories',
            'Ind AS 7: Statement of Cash Flows',
            'Ind AS 8: Accounting Policies, Changes in Accounting Estimates and Errors',
            'Ind AS 10: Events after the Reporting Period',
            'Ind AS 12: Income Taxes',
            'Ind AS 16: Property, Plant and Equipment',
            'Ind AS 19: Employee Benefits',
            'Ind AS 20: Accounting for Government Grants and Disclosure of Government Assistance',
            'Ind AS 21: The Effects of Changes in Foreign Exchange Rates',
            'Ind AS 23: Borrowing Costs',
            'Ind AS 24: Related Party Disclosures',
            'Ind AS 27: Separate Financial Statements',
            'Ind AS 28: Investments in Associates and Joint Ventures',
            'Ind AS 33: Earnings per Share',
            'Ind AS 34: Interim Financial Reporting',
            'Ind AS 36: Impairment of Assets',
            'Ind AS 37: Provisions, Contingent Liabilities and Contingent Assets',
            'Ind AS 38: Intangible Assets',
            'Ind AS 40: Investment Property',
            'Ind AS 41: Agriculture',
            'Ind AS 101: First-time Adoption of Indian Accounting Standards',
            'Ind AS 102: Share-based Payment',
            'Ind AS 103: Business Combinations',
            'Ind AS 105: Non-current Assets Held for Sale and Discontinued Operations',
            'Ind AS 108: Operating Segments',
            'Ind AS 110: Consolidated Financial Statements',
            'Ind AS 111: Joint Arrangements',
            'Ind AS 113: Fair Value Measurement',
            'Ind AS 115: Revenue from Contracts with Customers',
            'Ind AS 116: Leases',
            'Accounting and Reporting of Financial Instruments',
            'Chapter 15: Analysis of Financial Statements',
            'Chapter 16: Professional and Ethical Duty of a Chartered Accountant',
            'Chapter 17: Accounting and Technology',
            'Case Study'
          ]
        }
      ]
    },
    {
      name: 'Advanced Financial Management',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Financial Policy and Corporate Strategy',
            'Chapter 2: Risk Management',
            'Chapter 3: Advanced Capital Budgeting Decisions',
            'Chapter 4: Security Analysis',
            'Chapter 5: Security Valuation',
            'Chapter 6: Portfolio Management',
            'Chapter 7: Securitization',
            'Chapter 8: Mutual Funds',
            'Chapter 9: Derivatives Analysis and Valuation',
            'Chapter 10: Foreign Exchange Exposure and Risk Management',
            'Chapter 11: International Financial Management',
            'Chapter 12: Interest Rate Risk Management',
            'Chapter 13: Business Valuation',
            'Chapter 14: Mergers, Acquisitions and Corporate Restructuring',
            'Chapter 15: Startup Finance',
            'Case Study'
          ]
        }
      ]
    },
    {
      name: 'Advanced Auditing, Assurance and Professional Ethics',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Quality Control',
            'Chapter 2: General Auditing Principles and Auditors\' Responsibilities',
            'Chapter 3: Audit Planning, Strategy, and Execution',
            'Chapter 4: Materiality, Risk Assessment, and Internal Control',
            'Chapter 5: Audit Evidence',
            'Chapter 6: Completion and Review',
            'Chapter 7: Reporting',
            'Chapter 8: Specialised Areas',
            'Chapter 9: Related Services',
            'Chapter 10: Review of Financial Information',
            'Chapter 11: Prospective Financial Information and Other Assurance Services',
            'Chapter 12: Digital Auditing & Assurance',
            'Chapter 13: Group Audits',
            'Chapter 14: Special Features of Audit of Banks & Non-Banking Financial Companies',
            'Chapter 15: Overview of Audit of Public Sector Undertakings',
            'Chapter 16: Internal Audit',
            'Chapter 17: Due Diligence, Investigation & Forensic Accounting',
            'Chapter 18: Sustainable Development Goals (SDG) & Environment, Social and Governance (ESG) Assurance',
            'Chapter 19: Professional Ethics & Liabilities of Auditors',
            'Case Study'
          ]
        }
      ]
    },
    {
      name: 'Direct Tax Laws & International Taxation',
      sections: [
        {
          title: '',
          chapters: [
            'Chapter 1: Basic Concepts',
            'Chapter 2: Incomes which do not form part of Total Income',
            'Chapter 3: Profits and Gains of Business or Profession',
            'Chapter 4: Capital Gains',
            'Chapter 5: Income from Other Sources',
            'Chapter 6: Income of Other Persons included in Assessee\'s Total Income',
            'Chapter 7: Aggregation of Income, Set Off or Carry Forward of Losses',
            'Chapter 8: Deductions from Gross Total Income',
            'Chapter 9: Assessment of Various Entities',
            'Chapter 10: Assessment of Trusts and Institutions, Political Parties, and Other Special Entities',
            'Chapter 11: Tax Planning, Tax Avoidance, and Tax Evasion',
            'Chapter 12: Taxation of Digital Transactions',
            'Chapter 13: Deduction, Collection, and Recovery of Tax',
            'Chapter 14: Income Tax Authorities',
            'Chapter 15: Assessment Procedure',
            'Chapter 16: Appeals and Revision',
            'Chapter 17: Dispute Resolution',
            'Chapter 18: Miscellaneous Provisions',
            'Chapter 19: Provisions to Counteract Unethical Tax Practices',
            'Chapter 20: Tax Audit and Ethical Compliances',
            'Chapter 21: Non-Resident Taxation',
            'Chapter 22: Double Taxation Relief',
            'Chapter 23: Advance Rulings',
            'Chapter 24: Transfer Pricing',
            'Chapter 25: Fundamentals of BEPS',
            'Chapter 26: Application and Interpretation of Tax Treaties',
            'Chapter 27: Overview of Model Tax Conventions',
            'Chapter 28: Latest Developments in International Taxation',
            'Case Study'
          ]
        }
      ]
    },
    {
      name: 'Indirect Tax Laws',
      sections: [
        {
          title: 'GOODS AND SERVICES TAX (GST)',
          chapters: [
            'Chapter 1: Supply under GST',
            'Chapter 2: Charge of GST',
            'Chapter 3: Place of Supply',
            'Chapter 4: Exemptions from GST',
            'Chapter 5: Time of Supply',
            'Chapter 6: Value of Supply',
            'Chapter 7: Input Tax Credit',
            'Chapter 8: Registration',
            'Chapter 9: Tax Invoice, Credit and Debit Notes',
            'Chapter 10: Accounts and Records; E-way Bill',
            'Chapter 11: Payment of Tax',
            'Chapter 12: Electronic Commerce Transactions',
            'Chapter 13: Returns',
            'Chapter 14: Import and Export Under GST',
            'Chapter 15: Refunds',
            'Chapter 16: Job Work',
            'Chapter 17: Assessment and Audit',
            'Chapter 18: Inspection, Search, Seizure and Arrest',
            'Chapter 19: Demands and Recovery',
            'Chapter 20: Liability to Pay in Certain Cases',
            'Chapter 21: Offences and Penalties and Ethical Aspects under GST',
            'Chapter 22: Appeals and Revision',
            'Chapter 23: Advance Ruling',
            'Chapter 24: Miscellaneous Provisions'
          ]
        },
        {
          title: 'CUSTOMS & FTP',
          chapters: [
            'Chapter 1: Levy of and Exemptions from Customs Duty',
            'Chapter 2: Types of Duty',
            'Chapter 3: Classification of Imported and Export Goods',
            'Chapter 4: Valuation under the Customs Act, 1962',
            'Chapter 5: Importation and Exportation of Goods',
            'Chapter 6: Warehousing',
            'Chapter 7: Refund',
            'Chapter 8: Foreign Trade Policy',
            'Case Study'
          ]
        }
      ]
    },
    {
      name: 'Integrated Business Solutions',
      sections: [
        {
          title: 'CORPORATE AND ECONOMIC LAWS',
          chapters: [
            'Chapter 1: Appointment and Qualification of Directors',
            'Chapter 2: Appointment and Remuneration of Managerial Personnel',
            'Chapter 3: Meetings of Board and Its Powers',
            'Chapter 4: Inspection, Inquiry and Investigation',
            'Chapter 5: Compromises, Arrangements and Amalgamations',
            'Chapter 6: Prevention of Oppression and Mismanagement',
            'Chapter 7: Winding Up',
            'Chapter 8: Miscellaneous Provisions',
            'Chapter 9: Adjudication, Special Courts, NCLT & NCLAT',
            'Chapter 10: e-Filing',
            'Chapter 11: SEBI Act, 1992; SEBI (LODR), SEBI (ICDR), SEBI (SAST) and SEBI (PIT)',
            'Part II Chapter 1: The Foreign Exchange Management Act, 1999',
            'Part II Chapter 2: The Foreign Contribution Regulation Act, 2010',
            'Part II Chapter 3: The Insolvency and Bankruptcy Code, 2016'
          ]
        },
        {
          title: 'STRATEGIC COST & PERFORMANCE MANAGEMENT',
          chapters: [
            'Chapter 1: Introduction to Strategic Cost Management',
            'Chapter 2: Modern Business Environment',
            'Chapter 3: Lean System and Innovation',
            'Chapter 4: Specialist Cost Management Techniques',
            'Chapter 5: Management of Cost Strategically for Emerging Business Models',
            'Chapter 6: Strategic Revenue Management',
            'Chapter 7: Strategic Profit Management',
            'Chapter 8: An Introduction to Strategic Performance Management',
            'Chapter 9: Strategic Performance Measures in Private Sector',
            'Chapter 10: Strategic Performance Measures in the Non-for-Profit Organisations',
            'Chapter 11: Preparation of Performance Reports',
            'Chapter 12: Divisional Transfer Pricing',
            'Chapter 13: Standard Costing',
            'Chapter 14: Case Study',
            'Case Study'
          ]
        }
      ]
    }
  ]
};
