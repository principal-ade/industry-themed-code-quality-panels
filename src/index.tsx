import { QualityHexagonPanel } from "./panels/QualityHexagonPanel";
import { RepositoryQualityGridPanel } from "./panels/RepositoryQualityGridPanel";
import { LensDataDebugPanel } from "./panels/LensDataDebugPanel";
import type { PanelDefinition, PanelContextValue } from "./types";

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: "principal-ade.quality-hexagon-panel",
      name: "Code Quality",
      icon: "⬡",
      version: "0.1.0",
      author: "Principal ADE",
      description:
        "Visualize code quality metrics using a hexagonal radar chart showing tests, types, linting, formatting, documentation, and dead code.",
      slices: ["quality"],
      tools: [],
    },
    component: QualityHexagonPanel,

    onMount: async (context: PanelContextValue) => {
      console.log(
        "Quality Hexagon Panel mounted",
        context.currentScope.repository?.path,
      );

      if (context.hasSlice("quality") && !context.isSliceLoading("quality")) {
        await context.refresh("repository", "quality");
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      console.log("Quality Hexagon Panel unmounting");
    },
  },
  {
    metadata: {
      id: "principal-ade.repository-quality-grid-panel",
      name: "Repository Quality Grid",
      icon: "⬡",
      version: "0.1.0",
      author: "Principal ADE",
      description:
        "Display quality metrics for multiple repositories in a flat grid layout. Supports filtering by metric type, sorting, and comparing quality across projects.",
      slices: ["repositoriesQuality"],
      tools: [],
    },
    component: RepositoryQualityGridPanel,

    onMount: async (context: PanelContextValue) => {
      console.log("Repository Quality Grid Panel mounted");

      if (
        context.hasSlice("repositoriesQuality") &&
        !context.isSliceLoading("repositoriesQuality")
      ) {
        await context.refresh("workspace", "repositoriesQuality");
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      console.log("Repository Quality Grid Panel unmounting");
    },
  },
  {
    metadata: {
      id: "principal-ade.lens-data-debug-panel",
      name: "Lens Data Debug",
      icon: "🐛",
      version: "0.1.0",
      author: "Principal ADE",
      description:
        "Debug panel for inspecting raw lens results from quality-lens-cli. Shows package breakdown, lens results with pass/fail status, and files with issues.",
      slices: ["lensResults"],
      tools: [],
    },
    component: LensDataDebugPanel,

    onMount: async (context: PanelContextValue) => {
      console.log(
        "Lens Data Debug Panel mounted",
        context.currentScope.repository?.path,
      );

      if (
        context.hasSlice("lensResults") &&
        !context.isSliceLoading("lensResults")
      ) {
        await context.refresh("repository", "lensResults");
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      console.log("Lens Data Debug Panel unmounting");
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 */
export const onPackageLoad = async () => {
  console.log("Panel package loaded - Code Quality Panels");
};

/**
 * Optional: Called once when the package is unloaded.
 */
export const onPackageUnload = async () => {
  console.log("Panel package unloading - Code Quality Panels");
};

// Export components for direct usage
export {
  QualityHexagon,
  QualityHexagonCompact,
  QualityHexagonDetailed,
  QualityHexagonExpandable,
  calculateQualityTier,
  type QualityMetrics,
  type QualityTier,
  // Multi-repository grid components
  RepositoryQualityGrid,
  RepositoryQualityGridItem,
  type RepositoryQualityItem,
  type PackageQualityItem,
  type FlatGridItem,
} from "./components";

// Export panels
export { QualityHexagonPanel } from "./panels/QualityHexagonPanel";
export { RepositoryQualityGridPanel } from "./panels/RepositoryQualityGridPanel";
export { LensDataDebugPanel } from "./panels/LensDataDebugPanel";

// Export debug components
export {
  LensDataDebugPanel as LensDataDebugComponent,
  type FormattedResults,
  type LensResult,
  type Issue,
} from "./components";

// Export metrics list components
export { QualityMetricsList, QualityMetricsListCompact } from "./components";
