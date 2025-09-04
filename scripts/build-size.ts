#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function estimateGzipSize(bytes: number): number {
  // Rough estimate: gzip typically reduces size by 60-80%
  return Math.round(bytes * 0.3);
}

function estimateBrotliSize(bytes: number): number {
  // Rough estimate: brotli typically reduces size by 70-85%
  return Math.round(bytes * 0.25);
}

function getBuildSizes(): void {
  const distPath = path.join(__dirname, '..', 'dist');

  if (!fs.existsSync(distPath)) {
    console.log('❌ No dist folder found');
    return;
  }

  const files = fs
    .readdirSync(distPath)
    .filter((f: string) => f.endsWith('.js'));

  if (files.length === 0) {
    console.log('❌ No JavaScript files found in dist folder');
    return;
  }

  console.log('\n📦 Build Complete! File sizes:');
  console.log('─'.repeat(80));

  // Group files by type
  const bundleFiles = files.filter(f => f.startsWith('react-understate.'));
  const moduleFiles = files.filter(
    f => !f.startsWith('react-understate.') && f.endsWith('.js'),
  );

  let totalSize = 0;
  let bundleSize = 0;
  let totalGzipSize = 0;
  let totalBrotliSize = 0;

  if (bundleFiles.length > 0) {
    console.log('🚀 Bundle Files:');
    bundleFiles.forEach((file: string) => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      const gzipSize = estimateGzipSize(size);
      const brotliSize = estimateBrotliSize(size);

      totalSize += size;
      bundleSize += size;
      totalGzipSize += gzipSize;
      totalBrotliSize += brotliSize;

      console.log(
        `  ${file.padEnd(35)} ${formatBytes(size).padStart(12)} (gzip: ${formatBytes(gzipSize).padStart(8)}, brotli: ${formatBytes(brotliSize).padStart(8)})`,
      );
    });
    console.log('');
  }

  if (moduleFiles.length > 0) {
    console.log('📚 Module Files:');
    moduleFiles.forEach((file: string) => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      const gzipSize = estimateGzipSize(size);
      const brotliSize = estimateBrotliSize(size);

      totalSize += size;
      totalGzipSize += gzipSize;
      totalBrotliSize += brotliSize;

      console.log(
        `  ${file.padEnd(35)} ${formatBytes(size).padStart(12)} (gzip: ${formatBytes(gzipSize).padStart(8)}, brotli: ${formatBytes(brotliSize).padStart(8)})`,
      );
    });
    console.log('');
  }

  // Check for source maps
  const sourceMapFiles = fs
    .readdirSync(distPath)
    .filter((f: string) => f.endsWith('.map'));
  if (sourceMapFiles.length > 0) {
    console.log('🗺️  Source Maps:');
    let sourceMapSize = 0;
    sourceMapFiles.forEach((file: string) => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      sourceMapSize += size;
      console.log(`  ${file.padEnd(35)} ${formatBytes(size).padStart(12)}`);
    });
    console.log(
      `  Total Source Maps:${' '.repeat(20)} ${formatBytes(sourceMapSize).padStart(12)}`,
    );
    console.log('');
  }

  // Check for TypeScript declarations
  const declarationFiles = fs
    .readdirSync(distPath)
    .filter((f: string) => f.endsWith('.d.ts'));
  if (declarationFiles.length > 0) {
    console.log('📝 TypeScript Declarations:');
    let declarationSize = 0;
    declarationFiles.forEach((file: string) => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      declarationSize += size;
      console.log(`  ${file.padEnd(35)} ${formatBytes(size).padStart(12)}`);
    });
    console.log(
      `  Total Declarations:${' '.repeat(20)} ${formatBytes(declarationSize).padStart(12)}`,
    );
    console.log('');
  }

  console.log('─'.repeat(80));
  console.log(
    `  Bundle Total:${' '.repeat(22)} ${formatBytes(bundleSize).padStart(12)} (gzip: ${formatBytes(estimateGzipSize(bundleSize)).padStart(8)}, brotli: ${formatBytes(estimateBrotliSize(bundleSize)).padStart(8)})`,
  );
  console.log(
    `  All Files Total:${' '.repeat(19)} ${formatBytes(totalSize).padStart(12)} (gzip: ${formatBytes(totalGzipSize).padStart(8)}, brotli: ${formatBytes(totalBrotliSize).padStart(8)})`,
  );

  // Optimization recommendations
  console.log('\n💡 Optimization Recommendations:');
  if (bundleSize > 100 * 1024) {
    // > 100KB
    console.log('  ⚠️  Bundle size is large. Consider:');
    console.log('     • Code splitting and lazy loading');
    console.log('     • Tree-shaking unused exports');
    console.log('     • Using dynamic imports for optional features');
  } else if (bundleSize > 50 * 1024) {
    // > 50KB
    console.log('  ℹ️  Bundle size is moderate. Consider:');
    console.log('     • Analyzing bundle with rollup-plugin-visualizer');
    console.log('     • Removing unused dependencies');
  } else {
    console.log('  ✅ Bundle size is well optimized!');
  }

  console.log('');
}

getBuildSizes();
