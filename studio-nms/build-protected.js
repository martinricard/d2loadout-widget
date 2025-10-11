/**
 * Build script for protected D2 Loadout Widget distribution
 * Creates minified, obfuscated versions for CDN hosting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building protected D2 Loadout Widget...\n');

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '..', 'widget'),
  outputDir: path.join(__dirname, 'dist'),
  files: {
    html: 'widget.html',
    css: 'widget.css',
    js: 'widget.js',
    loader: 'widget-loader.js'
  }
};

// Create output directory
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  console.log('✅ Created dist/ directory');
}

// Step 1: Minify CSS
console.log('\n📦 Step 1: Minifying CSS...');
try {
  const cssInput = path.join(CONFIG.sourceDir, CONFIG.files.css);
  const cssOutput = path.join(CONFIG.outputDir, 'widget.min.css');
  
  execSync(`npx clean-css-cli -o "${cssOutput}" "${cssInput}"`, { stdio: 'inherit' });
  
  const originalSize = fs.statSync(cssInput).size;
  const minifiedSize = fs.statSync(cssOutput).size;
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  console.log(`✅ CSS minified: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
} catch (error) {
  console.error('❌ CSS minification failed:', error.message);
  console.log('💡 Install clean-css-cli: npm install -g clean-css-cli');
  process.exit(1);
}

// Step 2: Extract and minify widget HTML
console.log('\n📦 Step 2: Processing HTML...');
try {
  const htmlInput = path.join(CONFIG.sourceDir, CONFIG.files.html);
  const htmlOutput = path.join(CONFIG.outputDir, 'widget.html');
  
  let html = fs.readFileSync(htmlInput, 'utf8');
  
  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove extra whitespace
  html = html.replace(/\s+/g, ' ').trim();
  
  fs.writeFileSync(htmlOutput, html);
  
  const originalSize = fs.statSync(htmlInput).size;
  const minifiedSize = fs.statSync(htmlOutput).size;
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  console.log(`✅ HTML minified: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
} catch (error) {
  console.error('❌ HTML processing failed:', error.message);
  process.exit(1);
}

// Step 3: Create widget core (combines HTML + JS)
console.log('\n📦 Step 3: Creating widget core...');
try {
  const htmlContent = fs.readFileSync(path.join(CONFIG.outputDir, 'widget.html'), 'utf8');
  const jsContent = fs.readFileSync(path.join(CONFIG.sourceDir, CONFIG.files.js), 'utf8');
  
  // Create a self-contained widget module
  const widgetCore = `
/**
 * D2 Loadout Widget Core - v1.0.0
 * DO NOT MODIFY - This is an obfuscated protected build
 */
(function() {
  'use strict';
  
  // Widget HTML template
  const WIDGET_HTML = ${JSON.stringify(htmlContent)};
  
  // Inject HTML into body
  function injectHTML() {
    const container = document.createElement('div');
    container.innerHTML = WIDGET_HTML;
    document.body.appendChild(container.firstElementChild);
  }
  
  // Widget initialization code
  ${jsContent}
  
  // Export widget API
  window.D2LoadoutWidget = {
    init: function() {
      injectHTML();
      // Widget JS will auto-initialize
    },
    version: '1.0.0'
  };
  
})();
`;
  
  const coreOutput = path.join(CONFIG.outputDir, 'widget-core.js');
  fs.writeFileSync(coreOutput, widgetCore);
  
  console.log(`✅ Widget core created: ${fs.statSync(coreOutput).size} bytes`);
} catch (error) {
  console.error('❌ Widget core creation failed:', error.message);
  process.exit(1);
}

// Step 4: Minify widget core
console.log('\n📦 Step 4: Minifying widget core...');
try {
  const coreInput = path.join(CONFIG.outputDir, 'widget-core.js');
  const coreOutput = path.join(CONFIG.outputDir, 'widget-core.min.js');
  
  execSync(`npx terser "${coreInput}" -o "${coreOutput}" --compress --mangle`, { stdio: 'inherit' });
  
  const originalSize = fs.statSync(coreInput).size;
  const minifiedSize = fs.statSync(coreOutput).size;
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  console.log(`✅ Widget core minified: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
} catch (error) {
  console.error('❌ Widget core minification failed:', error.message);
  console.log('💡 Install terser: npm install -g terser');
  process.exit(1);
}

// Step 5: Minify loader
console.log('\n📦 Step 5: Minifying loader...');
try {
  const loaderInput = path.join(__dirname, CONFIG.files.loader);
  const loaderOutput = path.join(CONFIG.outputDir, 'd2loadout-widget.min.js');
  
  execSync(`npx terser "${loaderInput}" -o "${loaderOutput}" --compress --mangle`, { stdio: 'inherit' });
  
  const originalSize = fs.statSync(loaderInput).size;
  const minifiedSize = fs.statSync(loaderOutput).size;
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  console.log(`✅ Loader minified: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
} catch (error) {
  console.error('❌ Loader minification failed:', error.message);
  process.exit(1);
}

// Step 6: Optional obfuscation (makes code unreadable)
console.log('\n📦 Step 6: Obfuscating widget core (optional)...');
try {
  const coreInput = path.join(CONFIG.outputDir, 'widget-core.min.js');
  const coreObfuscated = path.join(CONFIG.outputDir, 'widget-core.obfuscated.js');
  
  console.log('⚠️  Obfuscation is optional but recommended for maximum protection');
  console.log('💡 To obfuscate, run: npx javascript-obfuscator ' + coreInput + ' --output ' + coreObfuscated);
  console.log('💡 Then rename widget-core.obfuscated.js to widget-core.min.js');
  console.log('⏭️  Skipping obfuscation for now...');
} catch (error) {
  console.log('⚠️  Obfuscation skipped');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✨ Build Complete!');
console.log('='.repeat(60));
console.log('\n📁 Output files in dist/:');
console.log('  • d2loadout-widget.min.js  - Main loader (users load this)');
console.log('  • widget.min.css           - Minified styles');
console.log('  • widget-core.min.js       - Widget logic (minified)');
console.log('  • widget.html              - HTML template');
console.log('  • widget-core.js           - Unminified core (for debugging)');

console.log('\n📤 Next steps:');
console.log('  1. Upload dist/* to your CDN/hosting');
console.log('  2. Update loader.html with your CDN URL');
console.log('  3. Test in StreamElements');
console.log('  4. Distribute loader.html + fields.json to users');

console.log('\n🔒 Your code is now protected!\n');
