import type { ReactNode } from "react";

type AgreementMarkdownProps = Readonly<{
  content: string;
}>;

function renderInlineMarkdown(line: string): ReactNode[] {
  const segments = line.split(/(\*\*[^*]+\*\*)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return (
        <strong className="font-semibold text-grayscale-1000" key={index}>
          {segment.slice(2, -2)}
        </strong>
      );
    }

    return segment;
  });
}

function getLineContent(line: string, pattern: RegExp) {
  return line.replace(pattern, "").trim();
}

export function AgreementMarkdown({ content }: AgreementMarkdownProps) {
  const lines = content.trim().split("\n");

  return (
    <div className="text-caption mt-3 space-y-3 text-grayscale-800">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) return null;

        if (trimmedLine.startsWith("### ")) {
          return (
            <h3
              className="text-body-md pt-2 font-semibold text-grayscale-1000"
              key={`${index}-${trimmedLine}`}
            >
              {renderInlineMarkdown(getLineContent(trimmedLine, /^###\s+/))}
            </h3>
          );
        }

        if (trimmedLine.startsWith("## ")) {
          return (
            <h2
              className="text-title-sm pt-4 text-grayscale-1000"
              key={`${index}-${trimmedLine}`}
            >
              {renderInlineMarkdown(getLineContent(trimmedLine, /^##\s+/))}
            </h2>
          );
        }

        if (trimmedLine.startsWith("- ")) {
          return (
            <p
              className="pl-3 text-grayscale-800"
              key={`${index}-${trimmedLine}`}
            >
              <span aria-hidden="true">- </span>
              {renderInlineMarkdown(getLineContent(trimmedLine, /^-\s+/))}
            </p>
          );
        }

        if (/^\d+\.\s+/.test(trimmedLine)) {
          return (
            <p
              className="pl-3 text-grayscale-800"
              key={`${index}-${trimmedLine}`}
            >
              {renderInlineMarkdown(trimmedLine)}
            </p>
          );
        }

        return (
          <p className="text-grayscale-800" key={`${index}-${trimmedLine}`}>
            {renderInlineMarkdown(trimmedLine)}
          </p>
        );
      })}
    </div>
  );
}
