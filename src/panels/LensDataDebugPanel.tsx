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

/**
 * LensDataDebugPanelContent - Internal component that uses theme
 */
const LensDataDebugPanelContent: React.FC<PanelComponentProps> = ({
  context,
  actions,
}) => {
  const { theme } = useTheme();

  // Get lens results data from context
  const lensResultsSlice =
    context.getSlice<LensResultsSliceData>("lensResults");
  const hasSlice = context.hasSlice("lensResults");
  const isLoading = lensResultsSlice?.loading ?? false;

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
        {lensResultsSlice?.data && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 11,
              color: theme.colors.textMuted,
            }}
          >
            <span>
              {
                new Set(
                  lensResultsSlice.data.results.map(
                    (r) => r.package?.name ?? "unknown",
                  ),
                ).size
              }{" "}
              packages
            </span>
            <span>{lensResultsSlice.data.results.length} results</span>
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
