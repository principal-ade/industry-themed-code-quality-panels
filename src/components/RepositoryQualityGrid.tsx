import * as React from "react";
import { cn } from "../lib/utils";
import type { Theme } from "@principal-ade/industry-theme";
import type { QualityMetrics } from "@principal-ai/codebase-composition";
import {
  QualityHexagon,
  calculateQualityTier,
  type QualityTier,
  type VertexHoverInfo,
  type MetricKey,
} from "./QualityHexagon";

export type { VertexHoverInfo, MetricKey };

const METRIC_OPTIONS: Array<{ key: MetricKey; label: string }> = [
  { key: "formatting", label: "Format" },
  { key: "linting", label: "Linting" },
  { key: "types", label: "Types" },
  { key: "tests", label: "Tests" },
  { key: "deadCode", label: "Dead Code" },
  { key: "documentation", label: "Docs" },
];

/**
 * Represents a single package within a repository
 */
export interface PackageQualityItem {
  /** Package name (e.g., "@acme/core" or "my-app") */
  name: string;
  /** Optional version string */
  version?: string;
  /** Quality metrics for this package */
  metrics: QualityMetrics;
}

/**
 * Represents a repository with one or more packages
 */
export interface RepositoryQualityItem {
  /** Unique identifier for the repository */
  id: string;
  /** Repository name */
  name: string;
  /** Optional path to the repository */
  path?: string;
  /** Packages within this repository (monorepos have multiple) */
  packages: PackageQualityItem[];
}

/**
 * A flattened item for display in the grid
 */
export interface FlatGridItem {
  /** Unique key for React */
  key: string;
  /** Repository ID */
  repositoryId: string;
  /** Repository name */
  repositoryName: string;
  /** Repository path (for filtering in other panels) */
  repositoryPath?: string;
  /** Package name */
  packageName: string;
  /** Optional version */
  version?: string;
  /** Quality metrics */
  metrics: QualityMetrics;
  /** Calculated tier */
  tier: QualityTier;
}

interface RepositoryQualityGridProps {
  /** Array of repositories with their packages */
  repositories: RepositoryQualityItem[];
  /** Theme from @principal-ade/industry-theme */
  theme: Theme;
  /** Callback when a grid item is clicked */
  onItemClick?: (item: FlatGridItem) => void;
  /** Callback when a hexagon vertex is clicked */
  onVertexClick?: (item: FlatGridItem, vertex: VertexHoverInfo) => void;
  /** Optional CSS class */
  className?: string;
  /** Show repository name in label (default: true) */
  showRepositoryName?: boolean;
  /** Show overall summary header (default: true) */
  showSummary?: boolean;
}

interface RepositoryQualityGridItemProps {
  /** The flattened item to display */
  item: FlatGridItem;
  /** Theme */
  theme: Theme;
  /** Click handler for the card */
  onClick?: () => void;
  /** Click handler for hexagon vertices */
  onVertexClick?: (item: FlatGridItem, vertex: VertexHoverInfo) => void;
  /** Show repository name in label */
  showRepositoryName?: boolean;
  /** Selected metric to display (from dropdown) */
  selectedMetric?: MetricKey | null;
  /** Optional CSS class */
  className?: string;
}

/**
 * Flatten repositories into a single array of grid items
 */
function flattenRepositories(
  repositories: RepositoryQualityItem[],
): FlatGridItem[] {
  const items: FlatGridItem[] = [];

  for (const repo of repositories) {
    for (const pkg of repo.packages) {
      items.push({
        key: `${repo.id}:${pkg.name}`,
        repositoryId: repo.id,
        repositoryName: repo.name,
        repositoryPath: repo.path,
        packageName: pkg.name,
        version: pkg.version,
        metrics: pkg.metrics,
        tier: calculateQualityTier(pkg.metrics),
      });
    }
  }

  return items;
}

/**
 * Calculate overall tier from all items
 */
function calculateOverallTier(items: FlatGridItem[]): QualityTier {
  if (items.length === 0) return "none";

  const avgMetrics = items.reduce(
    (acc, item) => ({
      tests: acc.tests + item.metrics.tests / items.length,
      deadCode: acc.deadCode + item.metrics.deadCode / items.length,
      linting: acc.linting + item.metrics.linting / items.length,
      formatting: acc.formatting + item.metrics.formatting / items.length,
      types: acc.types + item.metrics.types / items.length,
      documentation:
        acc.documentation + item.metrics.documentation / items.length,
    }),
    {
      tests: 0,
      deadCode: 0,
      linting: 0,
      formatting: 0,
      types: 0,
      documentation: 0,
    },
  );

  return calculateQualityTier(avgMetrics);
}

/**
 * Format the display label for an item
 */
function formatLabel(
  item: FlatGridItem,
  showRepositoryName: boolean,
  isSameAsRepo: boolean,
): string {
  if (!showRepositoryName || isSameAsRepo) {
    return item.packageName;
  }
  return `${item.repositoryName} / ${item.packageName}`;
}

/**
 * Individual grid item component
 */
// Get color based on value (good/medium/poor)
function getValueColor(value: number, key: MetricKey): string {
  // For deadCode, lower is better (invert the logic)
  const effectiveValue = key === "deadCode" ? 100 - value : value;

  if (effectiveValue >= 80) return "#2E7D32"; // forest green
  if (effectiveValue >= 60) return "#E6A700"; // amber
  return "#C62828"; // crimson
}

export function RepositoryQualityGridItem({
  item,
  theme,
  onClick,
  onVertexClick,
  showRepositoryName = true,
  selectedMetric,
  className,
}: RepositoryQualityGridItemProps) {
  const [hoveredVertex, setHoveredVertex] =
    React.useState<VertexHoverInfo | null>(null);
  const isSameAsRepo = item.packageName === item.repositoryName;
  const label = formatLabel(item, showRepositoryName, isSameAsRepo);

  const tierColors: Record<QualityTier, string> = {
    none: "#808080",
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
  };

  // Get the display info - either from selected metric or hovered vertex
  const displayInfo = React.useMemo(() => {
    if (selectedMetric) {
      const option = METRIC_OPTIONS.find((o) => o.key === selectedMetric);
      if (option) {
        const value = item.metrics[selectedMetric];
        return {
          label: option.label,
          value,
          valueColor: getValueColor(value, selectedMetric),
        };
      }
    }
    if (hoveredVertex) {
      return {
        label: hoveredVertex.label,
        value: hoveredVertex.value,
        valueColor: getValueColor(hoveredVertex.value, hoveredVertex.key),
      };
    }
    return null;
  }, [selectedMetric, hoveredVertex, item.metrics]);

  return (
    <div
      className={cn(className)}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = tierColors[item.tier];
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.colors.border;
        e.currentTarget.style.transform = "translateY(0)";
        setHoveredVertex(null);
      }}
    >
      {/* Metric info header */}
      <div
        style={{
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          minHeight: 24,
        }}
      >
        {displayInfo ? (
          <>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: theme.colors.text,
              }}
            >
              {displayInfo.label}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: displayInfo.valueColor,
              }}
            >
              {displayInfo.value}%
            </span>
          </>
        ) : (
          <span style={{ fontSize: 12, color: theme.colors.textMuted }}>
            Hover a corner
          </span>
        )}
      </div>
      <div style={{ width: 200, height: 200 }}>
        <QualityHexagon
          metrics={item.metrics}
          tier={item.tier}
          theme={theme}
          showLabels={false}
          showValues={false}
          onVertexHover={setHoveredVertex}
          onVertexLeave={() => setHoveredVertex(null)}
          onVertexClick={
            onVertexClick ? (vertex) => onVertexClick(item, vertex) : undefined
          }
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: theme.colors.text,
            textAlign: "center",
          }}
        >
          {label}
        </span>
        {item.version && (
          <span
            style={{
              fontSize: 10,
              color: theme.colors.textMuted,
            }}
          >
            v{item.version}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * RepositoryQualityGrid - Displays a flat grid of quality hexagons
 * for multiple repositories and their packages.
 *
 * Each hexagon shows the quality metrics for a single package,
 * labeled with "repo / package" format for clarity.
 */
// Calculate average score for an item (with deadCode inverted)
function calculateAverageScore(metrics: QualityMetrics): number {
  const adjusted = { ...metrics };
  adjusted.deadCode = 100 - adjusted.deadCode;
  return Object.values(adjusted).reduce((a, b) => a + b, 0) / 6;
}

export function RepositoryQualityGrid({
  repositories,
  theme,
  onItemClick,
  onVertexClick,
  className,
  showRepositoryName = true,
  showSummary = true,
}: RepositoryQualityGridProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey | null>(
    null,
  );
  const items = React.useMemo(
    () => flattenRepositories(repositories),
    [repositories],
  );
  const overallTier = React.useMemo(() => calculateOverallTier(items), [items]);

  // Sort items alphabetically by package name
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) =>
      a.packageName.localeCompare(b.packageName),
    );
  }, [items]);

  const tierColors: Record<QualityTier, string> = {
    none: "#808080",
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
  };

  const tierLabels: Record<QualityTier, string> = {
    none: "No Data",
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
  };

  if (items.length === 0) {
    return (
      <div
        className={cn(className)}
        style={{
          padding: 40,
          textAlign: "center",
          color: theme.colors.textMuted,
          backgroundColor: theme.colors.background,
          borderRadius: 8,
        }}
      >
        No repositories to display
      </div>
    );
  }

  return (
    <div
      className={cn(className)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Summary Header */}
      {showSummary && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "12px 16px",
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: theme.colors.text,
              }}
            >
              {items.length} {items.length === 1 ? "package" : "packages"}
            </span>
            <span style={{ color: theme.colors.textMuted }}>•</span>
            <span
              style={{
                fontSize: 14,
                color: theme.colors.textMuted,
              }}
            >
              {repositories.length}{" "}
              {repositories.length === 1 ? "repository" : "repositories"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Metric dropdown */}
            <select
              value={selectedMetric ?? ""}
              onChange={(e) =>
                setSelectedMetric(
                  e.target.value ? (e.target.value as MetricKey) : null,
                )
              }
              style={{
                padding: "4px 8px",
                fontSize: 13,
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 4,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="">Select metric...</option>
              {METRIC_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Tier badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 16,
                border: `1px solid ${tierColors[overallTier]}`,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: tierColors[overallTier],
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: tierColors[overallTier],
                }}
              >
                {tierLabels[overallTier]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Items */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
          padding: 16,
        }}
      >
        {sortedItems.map((item) => (
          <RepositoryQualityGridItem
            key={item.key}
            item={item}
            theme={theme}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
            onVertexClick={onVertexClick}
            showRepositoryName={showRepositoryName}
            selectedMetric={selectedMetric}
          />
        ))}
      </div>
    </div>
  );
}
