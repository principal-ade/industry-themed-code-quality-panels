import * as React from 'react';
import { cn } from '../lib/utils';
import type { Theme } from '@principal-ade/industry-theme';
import type { QualityMetrics } from '@principal-ai/codebase-composition';
import type { MetricKey } from './QualityHexagon';

export interface MetricListItem {
  key: MetricKey;
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

interface QualityMetricsListProps {
  metrics: QualityMetrics;
  theme: Theme;
  className?: string;
  onMetricClick?: (metric: MetricKey) => void;
}

// Get color based on value (good/medium/poor)
function getValueColor(value: number, key: string): string {
  // For deadCode, lower is better (invert the logic)
  const effectiveValue = key === 'deadCode' ? 100 - value : value;

  if (effectiveValue >= 80) return '#2E7D32'; // forest green
  if (effectiveValue >= 60) return '#E6A700'; // amber
  return '#C62828'; // crimson
}

// Get background color for the value indicator
function getValueBgColor(value: number, key: string): string {
  const effectiveValue = key === 'deadCode' ? 100 - value : value;

  if (effectiveValue >= 80) return 'rgba(46, 125, 50, 0.1)';
  if (effectiveValue >= 60) return 'rgba(230, 167, 0, 0.1)';
  return 'rgba(198, 40, 40, 0.1)';
}

// Icons for each metric
function getMetricIcon(key: MetricKey): React.ReactNode {
  const iconProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (key) {
    case 'types':
      // TypeScript/Types icon (diamond/brackets)
      return (
        <svg {...iconProps}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case 'documentation':
      // Docs icon (file with lines)
      return (
        <svg {...iconProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case 'tests':
      // Tests icon (check circle)
      return (
        <svg {...iconProps}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22,4 12,14.01 9,11.01" />
        </svg>
      );
    case 'deadCode':
      // Dead code icon (trash/code)
      return (
        <svg {...iconProps}>
          <polyline points="3,6 5,6 21,6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case 'formatting':
      // Formatting icon (align/indent)
      return (
        <svg {...iconProps}>
          <line x1="21" y1="10" x2="7" y2="10" />
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="21" y1="14" x2="3" y2="14" />
          <line x1="21" y1="18" x2="7" y2="18" />
        </svg>
      );
    case 'linting':
      // Linting icon (alert/shield)
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    default:
      return null;
  }
}

// Metrics configuration
const METRIC_CONFIG: { key: MetricKey; label: string; description: string }[] = [
  { key: 'types', label: 'Types', description: 'Type safety score' },
  { key: 'documentation', label: 'Documentation', description: 'Documentation coverage' },
  { key: 'tests', label: 'Tests', description: 'Test coverage and passing rate' },
  { key: 'deadCode', label: 'Dead Code', description: 'Unused code detected' },
  { key: 'formatting', label: 'Formatting', description: 'Code formatting consistency' },
  { key: 'linting', label: 'Linting', description: 'Linting compliance' },
];

export function QualityMetricsList({
  metrics,
  theme,
  className,
  onMetricClick,
}: QualityMetricsListProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {METRIC_CONFIG.map(({ key, label, description }) => {
        const value = metrics[key];
        const isDeadCode = key === 'deadCode';

        return (
          <div
            key={key}
            onClick={() => onMetricClick?.(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 6,
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              cursor: onMetricClick ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (onMetricClick) {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundLight;
                e.currentTarget.style.borderColor = theme.colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surface;
              e.currentTarget.style.borderColor = theme.colors.border;
            }}
          >
            {/* Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor: getValueBgColor(value, key),
                color: getValueColor(value, key),
                flexShrink: 0,
              }}
            >
              {getMetricIcon(key)}
            </div>

            {/* Label and description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: theme.colors.text,
                }}
              >
                {label}
                {isDeadCode && (
                  <span
                    style={{
                      fontSize: 11,
                      color: theme.colors.textMuted,
                      marginLeft: 4,
                    }}
                  >
                    (lower is better)
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: theme.colors.textMuted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {description}
              </div>
            </div>

            {/* Value */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              {/* Progress bar */}
              <div
                style={{
                  width: 60,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.border,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${isDeadCode ? 100 - value : value}%`,
                    height: '100%',
                    backgroundColor: getValueColor(value, key),
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* Percentage */}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: getValueColor(value, key),
                  minWidth: 45,
                  textAlign: 'right',
                }}
              >
                {value.toFixed(1)}%
              </span>
            </div>

            {/* Chevron if clickable */}
            {onMetricClick && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={theme.colors.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function QualityMetricsListCompact({
  metrics,
  theme,
  className,
  onMetricClick,
}: QualityMetricsListProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {METRIC_CONFIG.map(({ key, label }) => {
        const value = metrics[key];
        const isDeadCode = key === 'deadCode';

        return (
          <div
            key={key}
            onClick={() => onMetricClick?.(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 4,
              cursor: onMetricClick ? 'pointer' : 'default',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (onMetricClick) {
                e.currentTarget.style.backgroundColor = theme.colors.surface;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: theme.colors.textMuted,
              }}
            >
              {label}
              {isDeadCode && ' ↓'}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: getValueColor(value, key),
              }}
            >
              {value.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
