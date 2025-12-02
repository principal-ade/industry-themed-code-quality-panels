import { cn } from '../lib/utils';
import type { Theme } from '@principal-ade/industry-theme';
import type { QualityMetrics } from '@principal-ai/codebase-composition';

export type { QualityMetrics };
export type QualityTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

interface QualityHexagonProps {
  metrics: QualityMetrics;
  tier: QualityTier;
  theme: Theme;
  showLabels?: boolean;
  showValues?: boolean;
  className?: string;
}

// Helper to extract theme colors
function getThemeColors(theme: Theme) {
  return {
    gridColor: theme.colors.border,
    axisColor: theme.colors.muted,
    textColor: theme.colors.text,
    scoreColor: theme.colors.text,
    tierColors: {
      none: { fill: theme.colors.muted, stroke: theme.colors.border, bg: theme.colors.backgroundLight },
      bronze: { fill: theme.colors.warning, stroke: theme.colors.warning, bg: theme.colors.backgroundLight },
      silver: { fill: theme.colors.secondary, stroke: theme.colors.secondary, bg: theme.colors.backgroundLight },
      gold: { fill: theme.colors.accent, stroke: theme.colors.accent, bg: theme.colors.backgroundLight },
      platinum: { fill: theme.colors.primary, stroke: theme.colors.primary, bg: theme.colors.backgroundLight }
    },
    metricColors: {
      types: theme.colors.warning,
      documentation: theme.colors.info,
      tests: theme.colors.success,
      deadCode: theme.colors.error,
      formatting: theme.colors.accent,
      linting: theme.colors.primary
    },
    qualityIndicators: {
      good: theme.colors.success,
      medium: theme.colors.warning,
      poor: theme.colors.error
    }
  };
}

// Metrics ordered clockwise from top-left
const getMetricConfig = (themeColors: ReturnType<typeof getThemeColors>) => [
  { key: 'types', label: 'Types', color: themeColors.metricColors.types, angle: -120 },
  { key: 'documentation', label: 'Docs', color: themeColors.metricColors.documentation, angle: -60 },
  { key: 'tests', label: 'Tests', color: themeColors.metricColors.tests, angle: 0 },
  { key: 'deadCode', label: 'Dead Code', color: themeColors.metricColors.deadCode, angle: 60 },
  { key: 'formatting', label: 'Format', color: themeColors.metricColors.formatting, angle: 120 },
  { key: 'linting', label: 'Linting', color: themeColors.metricColors.linting, angle: 180 }
] as const;

function calculateHexagonPoints(center: number, radius: number, metricConfig: ReturnType<typeof getMetricConfig>): string {
  return metricConfig
    .map(({ angle }) => {
      const radian = (angle * Math.PI) / 180;
      const x = center + radius * Math.cos(radian);
      const y = center + radius * Math.sin(radian);
      return `${x},${y}`;
    })
    .join(' ');
}

function calculateMetricPoint(
  center: number,
  radius: number,
  angle: number,
  value: number
): { x: number; y: number } {
  const actualRadius = (radius * value) / 100;
  const radian = (angle * Math.PI) / 180;
  return {
    x: center + actualRadius * Math.cos(radian),
    y: center + actualRadius * Math.sin(radian)
  };
}

export function QualityHexagon({
  metrics,
  tier,
  theme,
  showLabels = false,
  showValues = false,
  className
}: QualityHexagonProps) {
  const themeColors = getThemeColors(theme);
  const colors = themeColors.tierColors[tier] ?? themeColors.tierColors.none;
  const metricConfig = getMetricConfig(themeColors);
  // Use fixed internal coordinates for viewBox
  const viewBoxSize = 300;
  const center = viewBoxSize / 2;
  const radius = viewBoxSize * 0.28;
  const padding = viewBoxSize * 0.1;
  const fontSize = viewBoxSize * 0.04;
  const strokeWidth = viewBoxSize * 0.008;
  const dotSize = viewBoxSize * 0.015;

  const hexagonPoints = calculateHexagonPoints(center, radius, metricConfig);

  const dataPoints = metricConfig
    .map(({ key, angle }) => {
      let value = metrics[key as keyof QualityMetrics];
      // Invert dead code metric (less is better)
      if (key === 'deadCode') {
        value = 100 - value;
      }
      return calculateMetricPoint(center, radius, angle, value);
    })
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  // Calculate average with inverted dead code
  const metricsForAverage = { ...metrics };
  metricsForAverage.deadCode = 100 - metricsForAverage.deadCode;
  const averageScore = Math.round(
    Object.values(metricsForAverage).reduce((a, b) => a + b, 0) / 6
  );

  const hexagon = (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className={cn('w-full h-full transition-all duration-300', className)}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      <g className="opacity-20">
        {[20, 40, 60, 80, 100].map((percent) => (
          <polygon
            key={percent}
            points={calculateHexagonPoints(center, (radius * percent) / 100, metricConfig)}
            fill="none"
            stroke={themeColors.gridColor}
            strokeWidth={0.5}
            style={{ opacity: 0.4 }}
          />
        ))}
      </g>

      {/* Axes */}
      {metricConfig.map(({ angle }) => {
        const endPoint = calculateMetricPoint(center, radius, angle, 100);
        return (
          <line
            key={angle}
            x1={center}
            y1={center}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke={themeColors.axisColor}
            strokeWidth={0.5}
            style={{ opacity: 0.5 }}
          />
        );
      })}

      {/* Outer hexagon */}
      <polygon
        points={hexagonPoints}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        style={{ opacity: 0.3 }}
      />

      {/* Data polygon */}
      <polygon
        points={dataPoints}
        fill={colors.fill}
        fillOpacity={0.3}
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        style={{ transition: 'all 0.5s ease' }}
      />

      {/* Vertex dots */}
      {metricConfig.map(({ key, angle }) => {
        let value = metrics[key as keyof QualityMetrics];
        // Invert dead code metric for display
        if (key === 'deadCode') {
          value = 100 - value;
        }
        const point = calculateMetricPoint(center, radius, angle, 100);
        const dataPoint = calculateMetricPoint(center, radius, angle, value);

        return (
          <g key={key}>
            {/* Outer vertex marker */}
            <circle
              cx={point.x}
              cy={point.y}
              r={dotSize}
              fill="white"
              stroke={colors.stroke}
              strokeWidth={1.5}
            />
            {/* Value indicator */}
            <circle
              cx={dataPoint.x}
              cy={dataPoint.y}
              r={dotSize * 0.7}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={1}
              style={{ opacity: 0.9 }}
            />
          </g>
        );
      })}

      {/* Center score */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={themeColors.scoreColor}
        fontSize={fontSize * 1.5}
        fontWeight="600"
      >
        {averageScore}
      </text>
      <text
        x={center}
        y={center + fontSize}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={themeColors.textColor}
        fontSize={fontSize * 0.8}
        style={{ opacity: 0.6 }}
      >
        avg
      </text>

      {/* Labels */}
      {showLabels && (
        <>
          {metricConfig.map(({ key, label, angle }) => {
            const labelRadius = radius + padding * 1.2;
            const point = calculateMetricPoint(center, labelRadius, angle, 100);
            const value = metrics[key as keyof QualityMetrics];

            return (
              <text
                key={key}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={themeColors.textColor}
                fontSize={fontSize}
              >
                {showValues ? `${value}%` : label}
              </text>
            );
          })}
        </>
      )}
    </svg>
  );

  // For non-interactive mode or when tooltips are not available, just return the hexagon
  return hexagon;
}

export function QualityHexagonCompact({
  metrics,
  tier,
  theme,
  className
}: Pick<QualityHexagonProps, 'metrics' | 'tier' | 'theme' | 'className'>) {
  return (
    <div className={cn('w-20 h-20', className)}>
      <QualityHexagon
        metrics={metrics}
        tier={tier}
        theme={theme}
        showLabels={false}
        showValues={false}
      />
    </div>
  );
}

interface QualityHexagonDetailedProps extends Pick<QualityHexagonProps, 'metrics' | 'tier' | 'theme' | 'className'> {
  packageName?: string;
  packageVersion?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function QualityHexagonDetailed({
  metrics,
  tier,
  theme,
  className,
  packageName,
  packageVersion,
  onRefresh,
  isRefreshing = false,
}: QualityHexagonDetailedProps) {
  const themeColors = getThemeColors(theme);
  const colors = themeColors.tierColors[tier] ?? themeColors.tierColors.none;
  const metricConfig = getMetricConfig(themeColors);

  const hasHeader = packageName || onRefresh;

  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: colors.bg,
      }}
    >
      {hasHeader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          {packageName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {packageName.startsWith('@') && packageName.includes('/') ? (
                <>
                  <span style={{
                    fontSize: 12,
                    color: theme.colors.textMuted,
                  }}>
                    {packageName.split('/')[0]}
                  </span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.stroke,
                  }}>
                    {packageName.split('/')[1]}
                  </span>
                </>
              ) : (
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.stroke,
                }}>
                  {packageName}
                </span>
              )}
              {packageVersion && (
                <span style={{
                  fontSize: 12,
                  color: theme.colors.textMuted,
                }}>
                  v{packageVersion}
                </span>
              )}
            </div>
          ) : <span />}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 4,
                background: theme.colors.surface,
                color: theme.colors.textMuted,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                opacity: isRefreshing ? 0.6 : 1,
              }}
              title="Refresh"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                }}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}>
        <div style={{ flex: '1 1 200px', maxWidth: 300, aspectRatio: '1 / 1' }}>
          <QualityHexagon
            metrics={metrics}
            tier={tier}
            theme={theme}
            showLabels={true}
            showValues={false}
          />
        </div>

        <div style={{ flex: '1 1 200px', minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 24px' }}>
          {metricConfig.map(({ key, label, color }) => {
            const value = metrics[key as keyof QualityMetrics];
            const displayValue = value;

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{
                  fontSize: 14,
                  color: theme.colors.textMuted,
                }}>
                  {label}{key === 'deadCode' ? ' ↓' : ''}
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: color,
                }}>
                  {displayValue}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate the quality tier based on metrics
 */
export function calculateQualityTier(metrics: QualityMetrics): QualityTier {
  // Invert dead code for calculation (less is better)
  const metricsForAverage = { ...metrics };
  metricsForAverage.deadCode = 100 - metricsForAverage.deadCode;

  const average = Object.values(metricsForAverage).reduce((a, b) => a + b, 0) / 6;

  if (average >= 90) return 'platinum';
  if (average >= 75) return 'gold';
  if (average >= 60) return 'silver';
  if (average >= 40) return 'bronze';
  return 'none';
}
