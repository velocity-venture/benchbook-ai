#!/usr/bin/env node

/**
 * Legal Corpus Validation Script
 * Validates that all required legal corpus files exist and are readable
 */

const fs = require('fs').promises;
const path = require('path');

const CORPUS_PATH = path.join(__dirname, '..', 'legal-corpus');

const REQUIRED_FILES = {
  'TCA Title 37': 'tca/title-37.html',
  'TCA Title 36': 'tca/title-36.html', 
  'TRJPP Rules': 'trjpp/all-rules.txt'
};

const OPTIONAL_DIRECTORIES = {
  'DCS Policies': 'dcs/',
  'Local Rules': 'local-rules/'
};

async function validateFile(name, relativePath) {
  const fullPath = path.join(CORPUS_PATH, relativePath);
  
  try {
    const stats = await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    const sizeKB = Math.round(stats.size / 1024);
    const sizeClass = sizeKB > 1000 ? 'large' : sizeKB > 100 ? 'medium' : 'small';
    
    console.log(`✅ ${name}: ${sizeKB}KB (${sizeClass})`);
    
    // Basic content validation
    if (content.length < 1000) {
      console.log(`   ⚠️  Warning: File seems small (${content.length} characters)`);
    }
    
    if (name.includes('TCA') && !content.includes('Tennessee Code Annotated')) {
      console.log(`   ⚠️  Warning: TCA file may not contain expected content`);
    }
    
    if (name.includes('TRJPP') && !content.includes('Rule')) {
      console.log(`   ⚠️  Warning: TRJPP file may not contain expected rules`);
    }
    
    return { status: 'ok', size: stats.size };
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`❌ ${name}: File not found at ${relativePath}`);
      return { status: 'missing', path: fullPath };
    } else {
      console.log(`❌ ${name}: Error reading file - ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }
}

async function validateDirectory(name, relativePath) {
  const fullPath = path.join(CORPUS_PATH, relativePath);
  
  try {
    const files = await fs.readdir(fullPath);
    const fileCount = files.filter(f => !f.startsWith('.')).length;
    
    if (fileCount > 0) {
      console.log(`✅ ${name}: ${fileCount} files found`);
      
      // Show a few example files
      const examples = files.slice(0, 3).join(', ');
      console.log(`   📁 Examples: ${examples}${fileCount > 3 ? '...' : ''}`);
      
      return { status: 'ok', fileCount };
    } else {
      console.log(`⚠️  ${name}: Directory exists but is empty`);
      return { status: 'empty' };
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠️  ${name}: Directory not found (optional)`);
      return { status: 'missing' };
    } else {
      console.log(`❌ ${name}: Error reading directory - ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }
}

async function testCorpusLoading() {
  console.log('\n🧪 Testing corpus loading functions...\n');
  
  try {
    // Test HTML extraction (simplified version)
    const tcaPath = path.join(CORPUS_PATH, 'tca/title-37.html');
    const tcaHtml = await fs.readFile(tcaPath, 'utf-8');
    
    // Basic HTML cleaning
    const cleanText = tcaHtml
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`✅ HTML extraction: ${Math.round(cleanText.length / 1024)}KB of clean text`);
    
    // Test for expected legal content
    const tcaMatches = cleanText.match(/(\d+-\d+-\d+)/g) || [];
    console.log(`✅ TCA sections detected: ${tcaMatches.slice(0, 5).join(', ')}... (${tcaMatches.length} total)`);
    
    return { status: 'ok', cleanTextSize: cleanText.length, tcaSections: tcaMatches.length };
    
  } catch (error) {
    console.log(`❌ Corpus loading test failed: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

async function generateReport() {
  console.log('🏛️  BenchBook.AI Legal Corpus Validation\n');
  console.log('=' .repeat(50));
  
  const results = {
    required: [],
    optional: [],
    errors: []
  };
  
  // Validate required files
  console.log('\n📋 Required Files:');
  for (const [name, path] of Object.entries(REQUIRED_FILES)) {
    const result = await validateFile(name, path);
    results.required.push({ name, path, ...result });
    
    if (result.status !== 'ok') {
      results.errors.push(`${name}: ${result.status}`);
    }
  }
  
  // Validate optional directories  
  console.log('\n📂 Optional Directories:');
  for (const [name, path] of Object.entries(OPTIONAL_DIRECTORIES)) {
    const result = await validateDirectory(name, path);
    results.optional.push({ name, path, ...result });
  }
  
  // Test corpus loading
  const loadingResult = await testCorpusLoading();
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log('=' .repeat(50));
  
  const requiredOk = results.required.filter(r => r.status === 'ok').length;
  const requiredTotal = results.required.length;
  
  console.log(`Required files: ${requiredOk}/${requiredTotal} OK`);
  
  if (results.errors.length === 0) {
    console.log('✅ All required files validated successfully!');
    console.log('✅ Claude API migration should work correctly.');
  } else {
    console.log(`❌ ${results.errors.length} issues found:`);
    results.errors.forEach(error => console.log(`   - ${error}`));
    console.log('\n🔧 Fix these issues before running Claude API migration.');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  const totalSize = results.required
    .filter(r => r.size)
    .reduce((sum, r) => sum + r.size, 0);
  
  const sizeMB = Math.round(totalSize / 1024 / 1024 * 10) / 10;
  console.log(`   📏 Total corpus size: ${sizeMB}MB`);
  
  if (sizeMB > 10) {
    console.log('   ⚡ Consider enabling prompt caching for better performance');
  }
  
  if (sizeMB > 20) {
    console.log('   🎯 Large corpus detected - ensure adequate server memory');
  }
  
  const dcsFiles = results.optional.find(r => r.name === 'DCS Policies');
  if (dcsFiles && dcsFiles.fileCount > 20) {
    console.log('   📄 Many DCS files found - consider selective loading based on query content');
  }
  
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm install @anthropic-ai/sdk');
  console.log('   2. Configure ANTHROPIC_API_KEY in .env.local'); 
  console.log('   3. Set USE_CLAUDE_API=true');
  console.log('   4. Test with: npm run dev');
}

// Run validation
if (require.main === module) {
  generateReport().catch(console.error);
}

module.exports = { validateFile, validateDirectory, testCorpusLoading };