export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Issue {
  id: string;
  file: string;
  line: number;
  severity: Severity;
  title: string;
  description: string;
  suggestedFix: string;
  originalCode: string;
  type: 'Security' | 'Bug' | 'Code Smell' | 'Performance';
}

export interface ScanResult {
  repoUrl: string;
  timestamp: string;
  filesScanned: number;
  durationMs: number;
  issues: Issue[];
  status: 'completed' | 'failed' | 'scanning';
  scannedFileContent?: string;
}

export interface ScanStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}