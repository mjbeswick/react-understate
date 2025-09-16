import React, { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';
import { loadCodeExample } from '../utils/loadCodeExample';

interface CodeExampleProps {
  filename: string;
  language?: string;
  className?: string;
}

const CodeExample: React.FC<CodeExampleProps> = ({ 
  filename, 
  language = 'tsx', 
  className = '' 
}) => {
  const [code, setCode] = useState<string>('// Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCode = async () => {
      try {
        const codeContent = await loadCodeExample(filename);
        setCode(codeContent);
      } catch (error) {
        console.error(`Failed to load code example: ${filename}`, error);
        setCode(`// Error loading code example: ${filename}`);
      } finally {
        setLoading(false);
      }
    };

    loadCode();
  }, [filename]);

  if (loading) {
    return (
      <div className={className}>
        <CodeBlock 
          language={language} 
          code="// Loading code example..." 
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <CodeBlock 
        language={language} 
        code={code} 
      />
    </div>
  );
};

export default CodeExample;
