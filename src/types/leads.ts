
export interface LeadsData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  createdAt: string;
  sourceId: string;
  source: string;
  memberId: string;
  convertedToCustomerAt: string;
  stage: string;
  associate: string;
  remarks: string;
  followUp1Date: string;
  followUpComments1: string;
  followUp2Date: string;
  followUpComments2: string;
  followUp3Date: string;
  followUpComments3: string;
  followUp4Date: string;
  followUpComments4: string;
  center: string;
  classType: string;
  hostId: string;
  status: string;
  channel: string;
  period: string;
  purchasesMade: number;
  ltv: number;
  visits: number;
  trialStatus: string;
  conversionStatus: string;
  retentionStatus: string;
}

export interface LeadsFilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  source: string[];
  stage: string[];
  status: string[];
  associate: string[];
  channel: string[];
  trialStatus: string[];
  conversionStatus: string[];
  retentionStatus: string[];
  minLTV?: number;
  maxLTV?: number;
}

export type LeadsMetricType = 
  | 'totalLeads'
  | 'leadToTrialConversion'
  | 'trialToMembershipConversion'
  | 'conversionSpan'
  | 'ltv'
  | 'successfulSources'
  | 'popularStages'
  | 'averageLTV'
  | 'totalRevenue'
  | 'followUpRate'
  | 'retentionRate'
  | 'visitFrequency'
  | 'purchaseFrequency';
