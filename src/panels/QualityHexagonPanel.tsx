import React from "react";
import { Hexagon, X, Copy, Check } from "lucide-react";
import { useTheme } from "@principal-ade/industry-theme";
import type { PanelComponentProps } from "../types";
import type { QualityMetrics } from "@principal-ai/codebase-composition";
import {
  QualityHexagonExpandable,
  QualityTier,
  calculateQualityTier,
} from "../components/QualityHexagon";
import {
  QualityEmptyState,
  checkFileExistsInTree,
  WORKFLOW_FILE_PATH,
} from "../components/QualityEmptyState";

// Mock package data - in real usage, this would come from a quality slice
const mockPackages: Array<{
  name: string;
  version?: string;
  metrics: QualityMetrics;
}> = [
  {
    name: "@principal-ade/code-quality-panels",
    version: "0.1.0",
    metrics: {
      tests: 75,
      deadCode: 15,
      linting: 85,
      formatting: 90,
      types: 88,
      documentation: 65,
    },
  },
];

// Package quality data shape from slice
interface PackageQuality {
  name: string;
  path?: string;
  version?: string;
  metrics: QualityMetrics;
  /** List of lens IDs that actually ran for this package */
  lensesRan?: string[];
  /** True if this is a monorepo orchestrator package (config-only, no source) */
  isOrchestrator?: boolean;
}

// Slice data shape
interface QualitySliceData {
  packages: PackageQuality[];
  lastUpdated: string;
}

// Metric to colorMode mapping for File City
const METRIC_TO_COLOR_MODE: Record<string, string> = {
  types: "typescript",
  documentation: "alexandria",
  tests: "coverage",
  deadCode: "knip",
  formatting: "prettier",
  linting: "eslint",
};

/**
 * QualityHexagonPanelContent - Internal component that uses theme
 */
const QualityHexagonPanelContent: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const [refreshingPackages, setRefreshingPackages] = React.useState<
    Set<string>
  >(new Set());
  const [showHelpOverlay, setShowHelpOverlay] = React.useState(false);
  const [copiedCommand, setCopiedCommand] = React.useState<string | null>(null);

  const handleCopyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch {
      console.log("Copy:", command);
    }
  };

  // Get quality data from context if available
  const qualitySlice = context.getSlice<QualitySliceData>("quality");
  const hasQualitySlice = context.hasSlice("quality");
  const isLoading = qualitySlice?.loading ?? false;

  // Get file tree to check for workflow presence
  const fileTreeSlice = context.getSlice<{
    allFiles?: Array<{ relativePath?: string; path?: string }>;
  }>("fileTree");
  const hasWorkflow = React.useMemo(() => {
    return checkFileExistsInTree(
      fileTreeSlice?.data ?? undefined,
      WORKFLOW_FILE_PATH,
    );
  }, [fileTreeSlice?.data]);

  // Determine packages to display
  // - If slice exists and has data, use it (filtering out orchestrator packages)
  // - If slice exists but is loading/empty, show empty
  // - If no slice at all, use mock data for demo
  const packages: PackageQuality[] = React.useMemo(() => {
    if (qualitySlice?.data?.packages) {
      // Filter out orchestrator packages - they're config-only with no source code
      return qualitySlice.data.packages.filter((pkg) => !pkg.isOrchestrator);
    }
    if (hasQualitySlice) {
      // Slice exists but no data yet (loading or empty)
      return [];
    }
    // No slice - use mock for demo
    return mockPackages;
  }, [qualitySlice?.data?.packages, hasQualitySlice]);

  // Handle refresh for a specific package
  const handleRefreshPackage = async (packageName: string) => {
    setRefreshingPackages((prev) => new Set(prev).add(packageName));
    try {
      if (context.hasSlice("quality")) {
        // In future, this could refresh just one package
        await context.refresh("repository", "quality");
      }
    } finally {
      setRefreshingPackages((prev) => {
        const next = new Set(prev);
        next.delete(packageName);
        return next;
      });
    }
  };

  // Handle refresh all
  const handleRefreshAll = async () => {
    const allNames = packages.map((p) => p.name);
    setRefreshingPackages(new Set(allNames));
    try {
      if (context.hasSlice("quality")) {
        await context.refresh("repository", "quality");
      }
    } finally {
      setRefreshingPackages(new Set());
    }
  };

  // Subscribe to events
  React.useEffect(() => {
    const unsubscribers = [
      events.on("principal-ade.quality-panel:refresh", async () => {
        await handleRefreshAll();
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, context, packages]);

  // Tier colors for display
  const tierColors: Record<QualityTier, string> = {
    none: "#808080",
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
  };

  // Collect all lenses that ran across all packages
  const allLensesRan = React.useMemo(() => {
    const lensSet = new Set<string>();
    for (const pkg of packages) {
      if (pkg.lensesRan) {
        for (const lens of pkg.lensesRan) {
          lensSet.add(lens);
        }
      }
    }
    return lensSet.size > 0 ? Array.from(lensSet) : undefined;
  }, [packages]);

  // Calculate overall tier from all packages
  const overallTier =
    packages.length > 0
      ? calculateQualityTier(
          packages.reduce(
            (acc, pkg) => ({
              tests: acc.tests + pkg.metrics.tests / packages.length,
              deadCode: acc.deadCode + pkg.metrics.deadCode / packages.length,
              linting: acc.linting + pkg.metrics.linting / packages.length,
              formatting:
                acc.formatting + pkg.metrics.formatting / packages.length,
              types: acc.types + pkg.metrics.types / packages.length,
              documentation:
                acc.documentation + pkg.metrics.documentation / packages.length,
            }),
            {
              tests: 0,
              deadCode: 0,
              linting: 0,
              formatting: 0,
              types: 0,
              documentation: 0,
            },
          ),
          allLensesRan,
        )
      : "none";

  return (
    <div
      style={{
        fontFamily: theme.fonts.body,
        height: "100%",
        minHeight: 0,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        overflowY: "auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 40,
          flexShrink: 0,
          padding: "0 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          boxSizing: "border-box",
        }}
      >
        <Hexagon size={20} color={tierColors[overallTier]} />
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Code Quality
        </h2>
        <span
          onClick={() => setShowHelpOverlay(true)}
          title="Click for help"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: `1px solid ${theme.colors.border}`,
            fontSize: 11,
            color: theme.colors.textMuted,
            cursor: "pointer",
          }}
        >
          ?
        </span>
        {packages.length > 1 && (
          <span
            style={{
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            {packages.length} packages
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Quality Hexagons for each package */}
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 16, minHeight: 0 }}
        >
          {isLoading ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: theme.colors.textMuted,
              }}
            >
              Loading quality metrics...
            </div>
          ) : packages.length === 0 ? (
            <QualityEmptyState theme={theme} hasWorkflow={hasWorkflow} />
          ) : (
            packages.map((pkg) => {
              const tier = calculateQualityTier(pkg.metrics, pkg.lensesRan);
              // Use package path from slice data
              // For single-package repos, path is empty string (root)
              // For monorepos, path would be like "packages/core"
              const packagePath = pkg.path ?? "";
              return (
                <QualityHexagonExpandable
                  key={pkg.name}
                  metrics={pkg.metrics}
                  tier={tier}
                  theme={theme}
                  packageName={pkg.name}
                  packageVersion={pkg.version}
                  packagePath={packagePath}
                  lensesRan={pkg.lensesRan}
                  onExpandChange={(expanded, info) => {
                    // Emit package:select event for cross-panel filtering
                    // When expanded, select this package; when collapsed, deselect
                    events.emit({
                      type: "package:select",
                      source: "principal-ade.quality-hexagon-panel",
                      timestamp: Date.now(),
                      payload: expanded
                        ? {
                            packagePath: info.packagePath ?? "",
                            packageName: info.packageName,
                          }
                        : null,
                    });
                  }}
                  onMetricClick={(metric) => {
                    // Emit colorMode event for File City
                    const colorMode = METRIC_TO_COLOR_MODE[metric];
                    if (colorMode) {
                      events.emit({
                        type: "quality:colorMode:select",
                        source: "principal-ade.quality-hexagon-panel",
                        timestamp: Date.now(),
                        payload: { colorMode },
                      });
                    }
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Help Overlay */}
      {showHelpOverlay && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowHelpOverlay(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              padding: 20,
              maxWidth: 400,
              width: "90%",
              border: `1px solid ${theme.colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.colors.text,
                }}
              >
                Quality Lens CLI
              </h3>
              <button
                onClick={() => setShowHelpOverlay(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  color: theme.colors.textMuted,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p
              style={{
                fontSize: 13,
                color: theme.colors.textMuted,
                margin: "0 0 12px 0",
              }}
            >
              Run quality checks locally with the CLI:
            </p>

            {[
              {
                cmd: "npx @principal-ai/quality-lens-cli init",
                label: "Initialize quality lens in your project",
              },
              {
                cmd: "npx @principal-ai/quality-lens-cli list",
                label: "List available quality lenses",
              },
            ].map(({ cmd, label }) => (
              <div key={cmd} style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: theme.colors.textMuted }}>
                  {label}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 6,
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    fontFamily: "monospace",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  <code style={{ color: theme.colors.text }}>{cmd}</code>
                  <button
                    onClick={() => handleCopyCommand(cmd)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                      border: "none",
                      backgroundColor: "transparent",
                      color: theme.colors.textMuted,
                      cursor: "pointer",
                    }}
                    title="Copy command"
                  >
                    {copiedCommand === cmd ? (
                      <Check size={14} color={theme.colors.success} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: theme.colors.background,
                borderRadius: 6,
                fontSize: 12,
                color: theme.colors.textMuted,
              }}
            >
              <strong style={{ color: theme.colors.text }}>Tiers:</strong>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span>🏆 Platinum: 90%+ average</span>
                <span>🥇 Gold: 75%+ average</span>
                <span>🥈 Silver: 60%+ average</span>
                <span>🥉 Bronze: 40%+ average</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * QualityHexagonPanel - A panel for visualizing code quality metrics
 */
export const QualityHexagonPanel = QualityHexagonPanelContent;
