import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  className = '',
}) => {
  return (
    <div className={className}>
      <SyntaxHighlighter language={language} style={vs}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
