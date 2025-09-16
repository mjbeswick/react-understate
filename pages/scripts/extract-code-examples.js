#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing the documentation files
const DOCS_DIR = path.join(__dirname, '../src/pages');
const CODE_EXAMPLES_DIR = path.join(__dirname, '../src/code-examples');

// Ensure code examples directory exists
if (!fs.existsSync(CODE_EXAMPLES_DIR)) {
  fs.mkdirSync(CODE_EXAMPLES_DIR, { recursive: true });
}

// Function to extract code blocks from a file
function extractCodeBlocks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const codeBlocks = [];
  
  // Match CodeBlock components with code prop
  const codeBlockRegex = /<CodeBlock\s+[^>]*code=\{`([\s\S]*?)`\}/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[1];
    const fullMatch = match[0];
    
    // Extract language if present
    const languageMatch = fullMatch.match(/language=["']([^"']+)["']/);
    const language = languageMatch ? languageMatch[1] : 'tsx';
    
    codeBlocks.push({
      code,
      language,
      fullMatch
    });
  }
  
  return codeBlocks;
}

// Function to generate a unique filename
function generateFilename(baseName, index, language) {
  const ext = language === 'typescript' ? 'ts' : 
              language === 'javascript' ? 'js' : 
              language === 'tsx' ? 'tsx' : 
              language === 'jsx' ? 'jsx' : 'ts';
  
  if (index === 0) {
    return `${baseName}.${ext}`;
  }
  return `${baseName}-${index + 1}.${ext}`;
}

// Function to process a single file
function processFile(filePath) {
  const relativePath = path.relative(DOCS_DIR, filePath);
  const baseName = path.basename(filePath, path.extname(filePath)).toLowerCase();
  
  console.log(`Processing ${relativePath}...`);
  
  const codeBlocks = extractCodeBlocks(filePath);
  
  if (codeBlocks.length === 0) {
    console.log(`  No code blocks found`);
    return [];
  }
  
  const extractedFiles = [];
  
  codeBlocks.forEach((block, index) => {
    const filename = generateFilename(baseName, index, block.language);
    const outputPath = path.join(CODE_EXAMPLES_DIR, filename);
    
    // Write the code to a separate file
    fs.writeFileSync(outputPath, block.code);
    
    extractedFiles.push({
      originalFile: relativePath,
      extractedFile: filename,
      language: block.language
    });
    
    console.log(`  Extracted: ${filename}`);
  });
  
  return extractedFiles;
}

// Function to recursively find all .tsx files
function findTsxFiles(dir) {
  const files = [];
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Main execution
console.log('Extracting code examples from documentation files...\n');

const tsxFiles = findTsxFiles(DOCS_DIR);
const allExtractedFiles = [];

for (const file of tsxFiles) {
  const extracted = processFile(file);
  allExtractedFiles.push(...extracted);
}

console.log(`\nExtraction complete!`);
console.log(`Total files processed: ${tsxFiles.length}`);
console.log(`Total code examples extracted: ${allExtractedFiles.length}`);

// Generate a summary file
const summaryPath = path.join(CODE_EXAMPLES_DIR, 'extraction-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(allExtractedFiles, null, 2));
console.log(`\nSummary written to: ${summaryPath}`);
