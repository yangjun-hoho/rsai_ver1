interface ReportSection {
  title: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
}

export interface ReportData {
  title: string;
  summary: string;
  sections: ReportSection[];
  conclusion: string;
  references?: string[];
}

export interface GenerateReportParams {
  reportType: string;
  detailType: string;
  title: string;
  reportLength: string;
  model?: string;
}

export async function generateReportContent(params: GenerateReportParams): Promise<Record<string, unknown>> {
  const response = await fetch('/api/work-support/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data.report as Record<string, unknown>;
}
