import * as React from 'react';
import { cn } from '../lib/utils';
import type { Theme } from '@principal-ade/industry-theme';

// Types matching the FormattedResults structure
export interface Issue {
  file: string;
  line: number;
  column?: number;
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  rule?: string;
  source: string;
  category?: string;
}

export interface LensResult {
  package: { name: string; path?: string };
  lens: { id: string; command: string };
  execution: {
    success: boolean;
    exitCode?: number;
    duration?: number;
    timestamp: number;
  };
  issues: Issue[];
  metrics: {
    filesAnalyzed: number;
    totalIssues: number;
    issuesBySeverity: {
      error: number;
      warning: number;
      info: number;
      hint: number;
    };
    executionTime: number;
    custom?: Record<string, unknown>;
  };
  fileMetrics?: Array<{
    file: string;
    score: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
  }>;
  coverage?: {
    line: number;
    branch?: number;
    function?: number;
    statement?: number;
  } | null;
}

export interface FormattedResults {
  metadata: {
    timestamp: string;
    version: string;
    totalPackages: number;
    totalLenses: number;
    git?: {
      commit?: string;
      branch?: string;
      repository?: string;
    };
  };
  results: LensResult[];
  qualityMetrics?: {
    packages: Array<{
      name: string;
      path?: string;
      hexagon: {
        tests: number;
        deadCode: number;
        formatting: number;
        linting: number;
        types: number;
        documentation: number;
      };
    }>;
  };
}

interface LensDataDebugPanelProps {
  data: FormattedResults;
  theme: Theme;
  className?: string;
  /** Pre-select a specific package */
  selectedPackage?: string;
  onFileClick?: (file: string, line?: number) => void;
  onPackageSelect?: (packageName: string) => void;
}

// Group results by package
function groupResultsByPackage(results: LensResult[]): Map<string, LensResult[]> {
  const map = new Map<string, LensResult[]>();
  for (const result of results) {
    const key = result.package.name;
    const existing = map.get(key) || [];
    existing.push(result);
    map.set(key, existing);
  }
  return map;
}

// Get unique files from issues
function getFilesWithIssues(issues: Issue[]): Map<string, Issue[]> {
  const fileMap = new Map<string, Issue[]>();
  for (const issue of issues) {
    if (!issue.file) continue;
    const existing = fileMap.get(issue.file) || [];
    existing.push(issue);
    fileMap.set(issue.file, existing);
  }
  return fileMap;
}

// Severity badge colors
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'error': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'info': return '#3b82f6';
    case 'hint': return '#6b7280';
    default: return '#6b7280';
  }
}

function getSeverityBg(severity: string): string {
  switch (severity) {
    case 'error': return 'rgba(239, 68, 68, 0.1)';
    case 'warning': return 'rgba(245, 158, 11, 0.1)';
    case 'info': return 'rgba(59, 130, 246, 0.1)';
    case 'hint': return 'rgba(107, 114, 128, 0.1)';
    default: return 'rgba(107, 114, 128, 0.1)';
  }
}

// Calculate package summary stats
function getPackageSummary(results: LensResult[]) {
  let totalErrors = 0;
  let totalWarnings = 0;
  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    totalErrors += result.metrics.issuesBySeverity.error;
    totalWarnings += result.metrics.issuesBySeverity.warning;
    if (result.execution.success) {
      passCount++;
    } else {
      failCount++;
    }
  }

  return { totalErrors, totalWarnings, passCount, failCount, lensCount: results.length };
}

export function LensDataDebugPanel({
  data,
  theme,
  className,
  selectedPackage: initialSelectedPackage,
  onFileClick,
  onPackageSelect,
}: LensDataDebugPanelProps) {
  const packageGroups = React.useMemo(() => groupResultsByPackage(data.results), [data.results]);
  const packageNames = React.useMemo(() => Array.from(packageGroups.keys()), [packageGroups]);

  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(
    initialSelectedPackage || (packageNames.length === 1 ? packageNames[0] : null)
  );
  const [expandedLens, setExpandedLens] = React.useState<string | null>(null);
  const [expandedFiles, setExpandedFiles] = React.useState<Set<string>>(new Set());

  const handlePackageSelect = (pkg: string) => {
    setSelectedPackage(pkg);
    setExpandedLens(null);
    setExpandedFiles(new Set());
    onPackageSelect?.(pkg);
  };

  const toggleLens = (lensId: string) => {
    setExpandedLens(expandedLens === lensId ? null : lensId);
    setExpandedFiles(new Set());
  };

  const toggleFile = (file: string) => {
    const newSet = new Set(expandedFiles);
    if (newSet.has(file)) {
      newSet.delete(file);
    } else {
      newSet.add(file);
    }
    setExpandedFiles(newSet);
  };

  const selectedResults = selectedPackage ? packageGroups.get(selectedPackage) || [] : [];

  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        backgroundColor: theme.colors.background,
        fontFamily: 'monospace',
        fontSize: 13,
      }}
    >
      {/* Package Selector */}
      {packageNames.length > 1 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 8,
        }}>
          {packageNames.map((pkg) => {
            const summary = getPackageSummary(packageGroups.get(pkg) || []);
            const isSelected = selectedPackage === pkg;

            return (
              <button
                key={pkg}
                onClick={() => handlePackageSelect(pkg)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                  backgroundColor: isSelected ? theme.colors.surface : 'transparent',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontWeight: 500 }}>{pkg}</span>
                <span style={{
                  fontSize: 11,
                  padding: '2px 6px',
                  borderRadius: 4,
                  backgroundColor: summary.totalErrors > 0
                    ? getSeverityBg('error')
                    : summary.totalWarnings > 0
                      ? getSeverityBg('warning')
                      : 'rgba(34, 197, 94, 0.1)',
                  color: summary.totalErrors > 0
                    ? getSeverityColor('error')
                    : summary.totalWarnings > 0
                      ? getSeverityColor('warning')
                      : '#22c55e',
                }}>
                  {summary.passCount}/{summary.lensCount} pass
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Single Package Header (when only one package) */}
      {packageNames.length === 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 12px',
          backgroundColor: theme.colors.surface,
          borderRadius: 6,
          marginBottom: 8,
        }}>
          <span style={{ fontWeight: 600, color: theme.colors.text }}>
            {packageNames[0]}
          </span>
          {(() => {
            const summary = getPackageSummary(selectedResults);
            return (
              <span style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: summary.totalErrors > 0
                  ? getSeverityBg('error')
                  : summary.totalWarnings > 0
                    ? getSeverityBg('warning')
                    : 'rgba(34, 197, 94, 0.1)',
                color: summary.totalErrors > 0
                  ? getSeverityColor('error')
                  : summary.totalWarnings > 0
                    ? getSeverityColor('warning')
                    : '#22c55e',
              }}>
                {summary.passCount}/{summary.lensCount} pass
              </span>
            );
          })()}
        </div>
      )}

      {/* No Package Selected */}
      {!selectedPackage && packageNames.length > 1 && (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: theme.colors.textMuted,
          backgroundColor: theme.colors.surface,
          borderRadius: 6,
        }}>
          Select a package above to view lens results
        </div>
      )}

      {/* Lens Results for Selected Package */}
      {selectedPackage && selectedResults.map((result, idx) => {
        const lensKey = `${result.lens.id}-${idx}`;
        const isExpanded = expandedLens === lensKey;
        const filesWithIssues = getFilesWithIssues(result.issues);
        const hasIssues = result.issues.length > 0;

        return (
          <div
            key={lensKey}
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {/* Lens Header */}
            <div
              onClick={() => toggleLens(lensKey)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: theme.colors.surface,
                cursor: 'pointer',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={theme.colors.textMuted}
                  strokeWidth="2"
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <polyline points="9,18 15,12 9,6" />
                </svg>
                <span style={{ fontWeight: 600, color: theme.colors.text }}>
                  {result.lens.id}
                </span>
                <span style={{ color: theme.colors.textMuted }}>
                  ({result.lens.command})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Execution status */}
                <span style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 11,
                  backgroundColor: result.execution.success
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  color: result.execution.success ? '#22c55e' : '#ef4444',
                }}>
                  {result.execution.success ? 'pass' : 'fail'}
                </span>

                {/* Issue counts */}
                {hasIssues && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {result.metrics.issuesBySeverity.error > 0 && (
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        backgroundColor: getSeverityBg('error'),
                        color: getSeverityColor('error'),
                      }}>
                        {result.metrics.issuesBySeverity.error} errors
                      </span>
                    )}
                    {result.metrics.issuesBySeverity.warning > 0 && (
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        backgroundColor: getSeverityBg('warning'),
                        color: getSeverityColor('warning'),
                      }}>
                        {result.metrics.issuesBySeverity.warning} warnings
                      </span>
                    )}
                  </div>
                )}

                {/* Files count */}
                <span style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  {result.metrics.filesAnalyzed} files
                </span>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div style={{
                padding: 12,
                backgroundColor: theme.colors.backgroundLight,
                borderTop: `1px solid ${theme.colors.border}`,
              }}>
                {/* Metrics Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 8,
                  marginBottom: 16,
                  padding: 12,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 4,
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: theme.colors.textMuted }}>Files Analyzed</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: theme.colors.text }}>
                      {result.metrics.filesAnalyzed}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: theme.colors.textMuted }}>Total Issues</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: theme.colors.text }}>
                      {result.metrics.totalIssues}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: theme.colors.textMuted }}>Duration</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: theme.colors.text }}>
                      {result.execution.duration || 0}ms
                    </div>
                  </div>
                  {result.coverage && (
                    <div>
                      <div style={{ fontSize: 11, color: theme.colors.textMuted }}>Coverage</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: theme.colors.text }}>
                        {result.coverage.line}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Files with Issues */}
                {filesWithIssues.size > 0 ? (
                  <div>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.colors.textMuted,
                      marginBottom: 8,
                    }}>
                      Files with Issues ({filesWithIssues.size})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Array.from(filesWithIssues.entries()).map(([file, issues]) => {
                        const isFileExpanded = expandedFiles.has(file);
                        return (
                          <div
                            key={file}
                            style={{
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              onClick={() => toggleFile(file)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                backgroundColor: theme.colors.surface,
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke={theme.colors.textMuted}
                                  strokeWidth="2"
                                  style={{
                                    transform: isFileExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.15s ease',
                                  }}
                                >
                                  <polyline points="9,18 15,12 9,6" />
                                </svg>
                                <span
                                  style={{
                                    color: theme.colors.text,
                                    cursor: onFileClick ? 'pointer' : 'default',
                                  }}
                                  onClick={(e) => {
                                    if (onFileClick) {
                                      e.stopPropagation();
                                      onFileClick(file);
                                    }
                                  }}
                                >
                                  {file}
                                </span>
                              </div>
                              <span style={{
                                fontSize: 11,
                                padding: '2px 6px',
                                borderRadius: 4,
                                backgroundColor: getSeverityBg('error'),
                                color: getSeverityColor('error'),
                              }}>
                                {issues.length} issues
                              </span>
                            </div>

                            {/* Issues list */}
                            {isFileExpanded && (
                              <div style={{
                                padding: 8,
                                backgroundColor: theme.colors.background,
                                borderTop: `1px solid ${theme.colors.border}`,
                                maxHeight: 300,
                                overflow: 'auto',
                              }}>
                                {issues.map((issue, issueIdx) => (
                                  <div
                                    key={issueIdx}
                                    onClick={() => onFileClick?.(file, issue.line)}
                                    style={{
                                      display: 'flex',
                                      gap: 8,
                                      padding: '6px 8px',
                                      borderRadius: 4,
                                      cursor: onFileClick ? 'pointer' : 'default',
                                      transition: 'background-color 0.1s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <span style={{
                                      fontSize: 11,
                                      color: theme.colors.textMuted,
                                      minWidth: 45,
                                    }}>
                                      L{issue.line}
                                    </span>
                                    <span style={{
                                      fontSize: 10,
                                      padding: '1px 4px',
                                      borderRadius: 3,
                                      backgroundColor: getSeverityBg(issue.severity),
                                      color: getSeverityColor(issue.severity),
                                      textTransform: 'uppercase',
                                    }}>
                                      {issue.severity.charAt(0)}
                                    </span>
                                    <span style={{
                                      flex: 1,
                                      fontSize: 12,
                                      color: theme.colors.text,
                                    }}>
                                      {issue.message}
                                    </span>
                                    {issue.rule && (
                                      <span style={{
                                        fontSize: 10,
                                        color: theme.colors.textMuted,
                                        opacity: 0.7,
                                      }}>
                                        {issue.rule}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: 16,
                    textAlign: 'center',
                    color: theme.colors.textMuted,
                    backgroundColor: theme.colors.surface,
                    borderRadius: 4,
                  }}>
                    No issues found
                  </div>
                )}

                {/* File Metrics if available */}
                {result.fileMetrics && result.fileMetrics.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.colors.textMuted,
                      marginBottom: 8,
                    }}>
                      File Metrics ({result.fileMetrics.length})
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      padding: 8,
                      backgroundColor: theme.colors.surface,
                      borderRadius: 4,
                    }}>
                      {result.fileMetrics.map((fm, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                          }}
                        >
                          <span style={{ color: theme.colors.text, fontSize: 12 }}>
                            {fm.file}
                          </span>
                          <span style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: fm.score >= 80 ? '#22c55e' : fm.score >= 60 ? '#f59e0b' : '#ef4444',
                          }}>
                            {fm.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
