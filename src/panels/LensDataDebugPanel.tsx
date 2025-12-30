import React from "react";
import { Bug } from "lucide-react";
import { useTheme } from "@principal-ade/industry-theme";
import type { PanelComponentProps } from "../types";
import {
  LensDataDebugPanel as LensDataDebugPanelComponent,
  type FormattedResults,
} from "../components/LensDataDebugPanel";

// Slice data shape - matches FormattedResults from quality-lens-cli
type LensResultsSliceData = FormattedResults;

// Payload type for package:select events
interface PackageSelectPayload {
  packagePath: string;
  packageName: string;
}

/**
 * LensDataDebugPanelContent - Internal component that uses theme
 */
const LensDataDebugPanelContent: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(
    null,
  );

  // Get lens results data from context
  const lensResultsSlice =
    context.getSlice<LensResultsSliceData>("lensResults");
  const hasSlice = context.hasSlice("lensResults");
  const isLoading = lensResultsSlice?.loading ?? false;

  // Get unique package names and build a lookup map
  const { packageNames, packagePathMap } = React.useMemo(() => {
    if (!lensResultsSlice?.data?.results)
      return { packageNames: [], packagePathMap: new Map<string, string>() };
    const names = new Set<string>();
    const pathMap = new Map<string, string>();

    lensResultsSlice.data.results.forEach((r) => {
      const name = r.package?.name ?? "unknown";
      const path = r.package?.path ?? "";
      names.add(name);
      // Map both path and name to package name for lookup
      if (path) pathMap.set(path, name);
      pathMap.set(name, name);
    });

    return { packageNames: Array.from(names), packagePathMap: pathMap };
  }, [lensResultsSlice?.data?.results]);

  // Auto-select first package
  React.useEffect(() => {
    if (packageNames.length > 0 && !selectedPackage) {
      setSelectedPackage(packageNames[0]);
    }
  }, [packageNames, selectedPackage]);

  // Subscribe to package:select events
  React.useEffect(() => {
    if (!events) return;

    const cleanup = events.on("package:select", (event) => {
      const payload = event.payload as PackageSelectPayload | null;
      if (!payload) return;

      // Try to match by path first, then by name
      const matchedPackage =
        packagePathMap.get(payload.packagePath) ??
        packagePathMap.get(payload.packageName) ??
        // Also try matching the last segment of the path
        packagePathMap.get(payload.packagePath.split("/").pop() ?? "");

      if (matchedPackage) {
        setSelectedPackage(matchedPackage);
      }
    });

    return cleanup;
  }, [events, packagePathMap]);

  // Handle file click - open in editor
  const handleFileClick = (file: string, line?: number) => {
    // Construct full path if we have repository context
    const repoPath = context.currentScope.repository?.path;
    const fullPath = repoPath ? `${repoPath}/${file}` : file;

    if (line) {
      // If actions support line numbers, use them
      actions.openFile?.(`${fullPath}:${line}`);
    } else {
      actions.openFile?.(fullPath);
    }
  };

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
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 40,
          flexShrink: 0,
          padding: "0 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Bug size={18} color={theme.colors.primary} />
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            Lens Data Debug
          </h2>
        </div>
        {lensResultsSlice?.data && packageNames.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 12,
            }}
          >
            {packageNames.length > 1 ? (
              <select
                value={selectedPackage ?? ""}
                onChange={(e) => setSelectedPackage(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.body,
                  fontSize: 12,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {packageNames.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {pkg}
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ color: theme.colors.textMuted }}>
                {packageNames[0]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: theme.colors.textMuted,
            }}
          >
            Loading lens results...
          </div>
        ) : !hasSlice || !lensResultsSlice?.data ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: theme.colors.textMuted,
            }}
          >
            <Bug
              size={48}
              color={theme.colors.border}
              style={{ marginBottom: 16 }}
            />
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              No lens data available
            </div>
            <div style={{ fontSize: 12 }}>
              Run quality-lens-cli or check that the lensResults slice is
              configured.
            </div>
          </div>
        ) : (
          <LensDataDebugPanelComponent
            data={lensResultsSlice.data}
            theme={theme}
            onFileClick={handleFileClick}
            selectedPackage={selectedPackage ?? undefined}
            onPackageSelect={setSelectedPackage}
          />
        )}
      </div>
    </div>
  );
};

/**
 * LensDataDebugPanel - A panel for inspecting raw lens results data
 *
 * This panel is useful for debugging and verifying that quality lens data
 * is being collected and formatted correctly. It shows:
 * - Package breakdown (for monorepos)
 * - Lens results with pass/fail status
 * - Files with issues and individual issue details
 */
export const LensDataDebugPanel = LensDataDebugPanelContent;
