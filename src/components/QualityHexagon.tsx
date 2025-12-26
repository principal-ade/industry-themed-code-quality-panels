import * as React from "react";
import { cn } from "../lib/utils";
import type { Theme } from "@principal-ade/industry-theme";
import type { QualityMetrics } from "@principal-ai/codebase-composition";

export type { QualityMetrics };
export type QualityTier = "none" | "bronze" | "silver" | "gold" | "platinum";
export type MetricKey =
  | "types"
  | "documentation"
  | "tests"
  | "deadCode"
  | "formatting"
  | "linting";

export interface VertexHoverInfo {
  key: MetricKey;
  label: string;
  value: number;
  color: string;
}

interface QualityHexagonProps {
  metrics: QualityMetrics;
  tier: QualityTier;
  theme: Theme;
  showLabels?: boolean;
  showValues?: boolean;
  className?: string;
  /** List of lens IDs that actually ran - used to determine which metrics are configured */
  lensesRan?: string[];
  onVertexHover?: (info: VertexHoverInfo) => void;
  onVertexLeave?: () => void;
  onVertexClick?: (info: VertexHoverInfo) => void;
}

// Helper to extract theme colors
function getThemeColors(theme: Theme) {
  return {
    gridColor: theme.colors.border,
    axisColor: theme.colors.muted,
    textColor: theme.colors.text,
    scoreColor: theme.colors.text,
    tierColors: {
      none: {
        fill: "#808080",
        stroke: "#808080",
        bg: theme.colors.backgroundLight,
      },
      bronze: {
        fill: "#CD7F32",
        stroke: "#CD7F32",
        bg: theme.colors.backgroundLight,
      },
      silver: {
        fill: "#C0C0C0",
        stroke: "#C0C0C0",
        bg: theme.colors.backgroundLight,
      },
      gold: {
        fill: "#FFD700",
        stroke: "#FFD700",
        bg: theme.colors.backgroundLight,
      },
      platinum: {
        fill: "#E5E4E2",
        stroke: "#E5E4E2",
        bg: theme.colors.backgroundLight,
      },
    },
    metricColors: {
      types: theme.colors.warning,
      documentation: theme.colors.info,
      tests: theme.colors.success,
      deadCode: theme.colors.error,
      formatting: theme.colors.accent,
      linting: theme.colors.primary,
    },
    qualityIndicators: {
      good: theme.colors.success,
      medium: theme.colors.warning,
      poor: theme.colors.error,
    },
  };
}

// Get color based on value (good/medium/poor)
function getValueColor(value: number, key: string): string {
  // For deadCode, lower is better (invert the logic)
  const effectiveValue = key === "deadCode" ? 100 - value : value;

  if (effectiveValue >= 80) return "#2E7D32"; // forest green
  if (effectiveValue >= 60) return "#E6A700"; // amber
  return "#C62828"; // crimson
}

// Map lens IDs to hexagon metric keys
const LENS_TO_METRIC_MAP: Record<string, MetricKey> = {
  // Linting tools
  eslint: "linting",
  biome: "linting",
  "biome-lint": "linting",
  oxlint: "linting",
  // Type checking tools
  typescript: "types",
  flow: "types",
  // Testing tools
  test: "tests",
  jest: "tests",
  vitest: "tests",
  "bun-test": "tests",
  mocha: "tests",
  playwright: "tests",
  cypress: "tests",
  // Formatting tools
  prettier: "formatting",
  "biome-format": "formatting",
  // Dead code detection
  knip: "deadCode",
  depcheck: "deadCode",
  // Documentation
  typedoc: "documentation",
  jsdoc: "documentation",
  alexandria: "documentation",
};

/**
 * Check if a metric has a lens that ran for it
 */
function isMetricConfigured(
  metricKey: MetricKey,
  lensesRan?: string[],
): boolean {
  if (!lensesRan || lensesRan.length === 0) {
    // If no lensesRan info, assume all are configured (backwards compatibility)
    return true;
  }
  return lensesRan.some((lensId) => LENS_TO_METRIC_MAP[lensId] === metricKey);
}

// Metrics ordered clockwise from top-left
const getMetricConfig = (themeColors: ReturnType<typeof getThemeColors>) =>
  [
    {
      key: "formatting",
      label: "Format",
      color: themeColors.metricColors.formatting,
      angle: -120,
    },
    {
      key: "linting",
      label: "Linting",
      color: themeColors.metricColors.linting,
      angle: -60,
    },
    {
      key: "types",
      label: "Types",
      color: themeColors.metricColors.types,
      angle: 0,
    },
    {
      key: "tests",
      label: "Tests",
      color: themeColors.metricColors.tests,
      angle: 60,
    },
    {
      key: "deadCode",
      label: "Dead Code",
      color: themeColors.metricColors.deadCode,
      angle: 120,
    },
    {
      key: "documentation",
      label: "Docs",
      color: themeColors.metricColors.documentation,
      angle: 180,
    },
  ] as const;

function calculateHexagonPoints(
  center: number,
  radius: number,
  metricConfig: ReturnType<typeof getMetricConfig>,
): string {
  return metricConfig
    .map(({ angle }) => {
      const radian = (angle * Math.PI) / 180;
      const x = center + radius * Math.cos(radian);
      const y = center + radius * Math.sin(radian);
      return `${x},${y}`;
    })
    .join(" ");
}

function calculateMetricPoint(
  center: number,
  radius: number,
  angle: number,
  value: number,
): { x: number; y: number } {
  const actualRadius = (radius * value) / 100;
  const radian = (angle * Math.PI) / 180;
  return {
    x: center + actualRadius * Math.cos(radian),
    y: center + actualRadius * Math.sin(radian),
  };
}

export function QualityHexagon({
  metrics,
  tier,
  theme,
  showLabels = false,
  showValues = false,
  className,
  lensesRan,
  onVertexHover,
  onVertexLeave,
  onVertexClick,
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
      // Check if this metric is configured
      const configured = isMetricConfigured(key as MetricKey, lensesRan);
      if (!configured) {
        // Unconfigured metrics show as 0 (collapsed on the hexagon)
        return calculateMetricPoint(center, radius, angle, 0);
      }
      let value = metrics[key as keyof QualityMetrics];
      // Invert dead code metric (less is better)
      if (key === "deadCode") {
        value = 100 - value;
      }
      return calculateMetricPoint(center, radius, angle, value);
    })
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // Calculate average with inverted dead code, only for configured metrics
  const configuredMetrics = metricConfig.filter(({ key }) =>
    isMetricConfigured(key as MetricKey, lensesRan),
  );
  const metricsForAverage = configuredMetrics.map(({ key }) => {
    const value = metrics[key as keyof QualityMetrics];
    return key === "deadCode" ? 100 - value : value;
  });
  const averageScore =
    metricsForAverage.length > 0
      ? Math.round(
          metricsForAverage.reduce((a, b) => a + b, 0) /
            metricsForAverage.length,
        )
      : 0;

  const hexagon = (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className={cn("w-full h-full transition-all duration-300", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      <g className="opacity-20">
        {[20, 40, 60, 80, 100].map((percent) => (
          <polygon
            key={percent}
            points={calculateHexagonPoints(
              center,
              (radius * percent) / 100,
              metricConfig,
            )}
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
        style={{ transition: "all 0.5s ease" }}
      />

      {/* Vertex dots */}
      {metricConfig.map(({ key, label, color, angle }) => {
        const configured = isMetricConfigured(key as MetricKey, lensesRan);
        const rawValue = metrics[key as keyof QualityMetrics];
        let value = rawValue;
        // Invert dead code metric for display
        if (key === "deadCode") {
          value = 100 - value;
        }
        // For unconfigured metrics, show at center (0)
        const effectiveValue = configured ? value : 0;
        const point = calculateMetricPoint(center, radius, angle, 100);
        const dataPoint = calculateMetricPoint(
          center,
          radius,
          angle,
          effectiveValue,
        );

        const vertexInfo: VertexHoverInfo = {
          key: key as MetricKey,
          label,
          value: rawValue,
          color,
        };

        const handleMouseEnter = () => {
          onVertexHover?.(vertexInfo);
        };

        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (configured) {
            onVertexClick?.(vertexInfo);
          }
        };

        return (
          <g
            key={key}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onVertexLeave}
            onClick={handleClick}
            style={{
              cursor:
                configured && (onVertexHover || onVertexClick)
                  ? "pointer"
                  : "default",
              opacity: configured ? 1 : 0.4,
            }}
          >
            {/* Larger invisible hit area for easier hovering */}
            <circle
              cx={point.x}
              cy={point.y}
              r={dotSize * 2.5}
              fill="transparent"
            />
            {/* Outer vertex marker */}
            <circle
              cx={point.x}
              cy={point.y}
              r={dotSize}
              fill={configured ? "white" : themeColors.gridColor}
              stroke={configured ? colors.stroke : themeColors.gridColor}
              strokeWidth={1.5}
              strokeDasharray={configured ? "none" : "2,2"}
            />
            {/* Value indicator - only show if configured */}
            {configured && (
              <circle
                cx={dataPoint.x}
                cy={dataPoint.y}
                r={dotSize * 0.7}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={1}
                style={{ opacity: 0.9 }}
              />
            )}
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
  className,
}: Pick<QualityHexagonProps, "metrics" | "tier" | "theme" | "className">) {
  return (
    <div className={cn("w-20 h-20", className)}>
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

interface QualityHexagonDetailedProps
  extends Pick<
    QualityHexagonProps,
    "metrics" | "tier" | "theme" | "className"
  > {
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
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: colors.bg,
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {packageName ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {packageName.startsWith("@") && packageName.includes("/") ? (
                <>
                  <span
                    style={{
                      fontSize: 12,
                      color: theme.colors.textMuted,
                    }}
                  >
                    {packageName.split("/")[0]}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: colors.stroke,
                    }}
                  >
                    {packageName.split("/")[1]}
                  </span>
                </>
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.stroke,
                  }}
                >
                  {packageName}
                </span>
              )}
              {packageVersion && (
                <span
                  style={{
                    fontSize: 12,
                    color: theme.colors.textMuted,
                  }}
                >
                  v{packageVersion}
                </span>
              )}
            </div>
          ) : (
            <span />
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 4,
                background: theme.colors.surface,
                color: theme.colors.textMuted,
                cursor: isRefreshing ? "not-allowed" : "pointer",
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
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ flex: "1 1 200px", maxWidth: 300, aspectRatio: "1 / 1" }}>
          <QualityHexagon
            metrics={metrics}
            tier={tier}
            theme={theme}
            showLabels={true}
            showValues={false}
          />
        </div>

        <div
          style={{
            flex: "1 1 200px",
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "8px 24px",
          }}
        >
          {metricConfig.map(({ key, label }) => {
            const value = metrics[key as keyof QualityMetrics];

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: theme.colors.textMuted,
                  }}
                >
                  {label}
                  {key === "deadCode" ? " ↓" : ""}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: getValueColor(value, key),
                  }}
                >
                  {value}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface QualityHexagonExpandableProps
  extends Pick<
    QualityHexagonProps,
    "metrics" | "tier" | "theme" | "className"
  > {
  packageName?: string;
  packageVersion?: string;
  packagePath?: string;
  /** List of lens IDs that actually ran for this package */
  lensesRan?: string[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  defaultExpanded?: boolean;
  /** Callback when the hexagon is expanded/collapsed */
  onExpandChange?: (
    expanded: boolean,
    info: { packageName?: string; packagePath?: string },
  ) => void;
  /** Callback when a metric row is clicked */
  onMetricClick?: (metric: MetricKey) => void;
}

export function QualityHexagonExpandable({
  metrics,
  tier,
  theme,
  className,
  packageName,
  packageVersion,
  packagePath,
  lensesRan,
  onRefresh,
  isRefreshing = false,
  defaultExpanded = false,
  onExpandChange,
  onMetricClick,
}: QualityHexagonExpandableProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const handleToggleExpand = React.useCallback(() => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpandChange?.(newExpanded, { packageName, packagePath });
  }, [expanded, onExpandChange, packageName, packagePath]);
  const themeColors = getThemeColors(theme);
  const colors = themeColors.tierColors[tier] ?? themeColors.tierColors.none;
  const metricConfig = getMetricConfig(themeColors);

  const hasHeader = packageName || onRefresh;

  return (
    <div
      className={cn(className)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: colors.bg,
        flex: "1 1 200px",
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {packageName ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {packageName.startsWith("@") && packageName.includes("/") ? (
                <>
                  <span
                    style={{
                      fontSize: 12,
                      color: theme.colors.textMuted,
                    }}
                  >
                    {packageName.split("/")[0]}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: colors.stroke,
                    }}
                  >
                    {packageName.split("/")[1]}
                  </span>
                </>
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.stroke,
                  }}
                >
                  {packageName}
                </span>
              )}
              {packageVersion && (
                <span
                  style={{
                    fontSize: 12,
                    color: theme.colors.textMuted,
                  }}
                >
                  v{packageVersion}
                </span>
              )}
            </div>
          ) : (
            <span />
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 4,
                background: theme.colors.surface,
                color: theme.colors.textMuted,
                cursor: isRefreshing ? "not-allowed" : "pointer",
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
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
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

      {/* Clickable hexagon */}
      <div
        onClick={handleToggleExpand}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: 200, height: 200 }}>
          <QualityHexagon
            metrics={metrics}
            tier={tier}
            theme={theme}
            showLabels={true}
            showValues={false}
            lensesRan={lensesRan}
          />
        </div>
      </div>

      {/* Expandable metrics breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "8px 24px",
              borderTop: `1px solid ${theme.colors.border}`,
              marginTop: 8,
            }}
          >
            {metricConfig.map(({ key, label }) => {
              const value = metrics[key as keyof QualityMetrics];
              const configured = isMetricConfigured(key as MetricKey, lensesRan);

              return (
                <div
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (configured) {
                      onMetricClick?.(key as MetricKey);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    cursor: configured && onMetricClick ? "pointer" : "default",
                    padding: "4px 8px",
                    margin: "0 -8px",
                    borderRadius: 4,
                    transition: "background-color 0.15s ease",
                    opacity: configured ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (configured && onMetricClick) {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.surface;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: theme.colors.textMuted,
                    }}
                  >
                    {label}
                    {key === "deadCode" ? " ↓" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: configured ? getValueColor(value, key) : theme.colors.textMuted,
                    }}
                    title={configured ? undefined : "Not configured"}
                  >
                    {configured ? `${value}%` : "N/A"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expand/collapse indicator */}
      <div
        onClick={handleToggleExpand}
        style={{
          display: "flex",
          justifyContent: "center",
          cursor: "pointer",
          padding: 4,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.colors.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Calculate the quality tier based on metrics
 * @param metrics - The quality metrics
 * @param lensesRan - Optional list of lens IDs that ran, to filter unconfigured metrics
 */
export function calculateQualityTier(
  metrics: QualityMetrics,
  lensesRan?: string[],
): QualityTier {
  // Get all metric keys
  const allMetricKeys: MetricKey[] = [
    "formatting",
    "linting",
    "types",
    "tests",
    "deadCode",
    "documentation",
  ];

  // Filter to only configured metrics if lensesRan is provided
  const configuredKeys = allMetricKeys.filter((key) =>
    isMetricConfigured(key, lensesRan),
  );

  if (configuredKeys.length === 0) {
    return "none";
  }

  // Calculate average with inverted dead code, only for configured metrics
  const values = configuredKeys.map((key) => {
    const value = metrics[key];
    return key === "deadCode" ? 100 - value : value;
  });

  const average = values.reduce((a, b) => a + b, 0) / values.length;

  if (average >= 90) return "platinum";
  if (average >= 75) return "gold";
  if (average >= 60) return "silver";
  if (average >= 40) return "bronze";
  return "none";
}
