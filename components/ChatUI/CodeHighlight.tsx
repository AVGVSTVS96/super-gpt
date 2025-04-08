'use client';

import type { ReactNode } from 'react';
import { useShikiHighlighter, isInlineCode, type Element } from 'react-shiki';

interface CodeHighlightProps {
  className?: string | undefined;
  children?: ReactNode | undefined;
  node?: Element | undefined;
  inline?: boolean | undefined;
}

export const CodeHighlight = ({
  className,
  children,
  inline,
  node,
  ...props
}: CodeHighlightProps) => {
  const code = String(children).trim();
  const language = className?.split('language-')?.[1];

  const highlightedCode = useShikiHighlighter(
    code,
    language,
    'andromeeda',
  );

  const isInline = node && isInlineCode(node);

  return (!isInline || !inline) ? (
    <div className="shiki not-prose relative [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:px-6 [&_pre]:py-5">
      {language ? (
        <span className="absolute right-3 top-2 text-xs tracking-tighter text-muted-foreground/85">
          {language}
        </span>
      ) : null}
      {highlightedCode}
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
