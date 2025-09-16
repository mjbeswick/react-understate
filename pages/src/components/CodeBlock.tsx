import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'javascript', 
  className = '' 
}) => {
  return (
    <div className={className}>
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        customStyle={{
          margin: '1.5rem 0',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
