import React from 'react';
import { Terminal, Copy, Check, ChevronRight } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';

interface QualityEmptyStateProps {
  theme: Theme;
  hasWorkflow: boolean;
}

const WORKFLOW_FILE_PATH = '.github/workflows/quality-lens.yml';

/**
 * Check if a file path exists in a FileTree's allFiles array
 */
export function checkFileExistsInTree(
  treeData: { allFiles?: Array<{ relativePath?: string; path?: string }> } | undefined,
  targetPath: string
): boolean {
  if (!treeData?.allFiles) return false;

  const normalizedTarget = targetPath.replace(/^\//, '').toLowerCase();

  return treeData.allFiles.some((file) => {
    const filePath = (file.relativePath || file.path || '').toLowerCase();
    return filePath.endsWith(normalizedTarget) || filePath === normalizedTarget;
  });
}

/**
 * Copyable command line component
 */
const CommandLine: React.FC<{
  command: string;
  theme: Theme;
}> = ({ command, theme }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.log('Copy:', command);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 6,
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        fontFamily: 'monospace',
        fontSize: 13,
      }}
    >
      <code style={{ color: theme.colors.text }}>{command}</code>
      <button
        onClick={handleCopy}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          border: 'none',
          backgroundColor: 'transparent',
          color: theme.colors.textMuted,
          cursor: 'pointer',
        }}
        title="Copy command"
      >
        {copied ? (
          <Check size={16} color={theme.colors.success} />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
};

/**
 * Empty state component for when no quality data is available
 */
export const QualityEmptyState: React.FC<QualityEmptyStateProps> = ({
  theme,
  hasWorkflow,
}) => {
  if (hasWorkflow) {
    // Workflow exists but no data yet
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0',
          gap: 16,
          width: '100%',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: theme.colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          Quality metrics will appear here after your next CI run completes.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 6,
            backgroundColor: `${theme.colors.success}15`,
            color: theme.colors.success,
            fontSize: 13,
          }}
        >
          <Check size={16} />
          <span>Workflow detected at {WORKFLOW_FILE_PATH}</span>
        </div>
      </div>
    );
  }

  // No workflow - show CLI setup instructions
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        gap: 16,
        width: '100%',
      }}
    >
      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: theme.colors.textMuted,
          lineHeight: 1.5,
        }}
      >
        Track your code quality with automated analysis of tests, linting,
        types, formatting, dead code, and documentation.
      </p>

      {/* CLI Setup Steps */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 20,
          borderRadius: 8,
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}
        >
          <Terminal size={20} color={theme.colors.text} />
          <h4
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            Get Started
          </h4>
        </div>

        {/* Step 1 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              1
            </span>
            <span>Install the CLI</span>
          </div>
          <CommandLine
            command="npm install -g @principal-ai/quality-lens-cli"
            theme={theme}
          />
        </div>

        {/* Step 2 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              2
            </span>
            <span>Check what quality tools are available</span>
          </div>
          <CommandLine command="quality-lens list" theme={theme} />
        </div>

        {/* Step 3 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              3
            </span>
            <span>Set up the GitHub Action</span>
          </div>
          <CommandLine command="quality-lens init" theme={theme} />
        </div>

        {/* Next steps hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingTop: 8,
            fontSize: 13,
            color: theme.colors.textMuted,
          }}
        >
          <ChevronRight size={14} />
          <span>Then commit and push to start tracking quality</span>
        </div>
      </div>
    </div>
  );
};

export { WORKFLOW_FILE_PATH };
