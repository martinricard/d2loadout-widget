/**
 * D2 Loadout Widget - Protected Loader Script
 * This script loads the widget remotely to protect the source code
 */

(function() {
  'use strict';

  // Configuration
  const CDN_BASE_URL = 'https://YOUR-CDN-URL.com'; // CHANGE THIS!
  const VERSION = '1.0.0';
  
  // Get widget container
  const widgetId = document.currentScript?.getAttribute('data-widget-id') || 'd2loadout-widget';
  
  console.log(`[D2 Loadout Widget] Loading version ${VERSION}...`);

  /**
   * Load CSS file
   */
  function loadCSS(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
      document.head.appendChild(link);
    });
  }

  /**
   * Load JavaScript file
   */
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.body.appendChild(script);
    });
  }

  /**
   * Initialize widget
   */
  async function initWidget() {
    try {
      // Cache busting timestamp
      const timestamp = Date.now();
      
      // Load CSS
      console.log('[D2 Loadout Widget] Loading styles...');
      await loadCSS(`${CDN_BASE_URL}/widget.min.css?v=${timestamp}`);
      
      // Load widget core
      console.log('[D2 Loadout Widget] Loading widget core...');
      await loadScript(`${CDN_BASE_URL}/widget-core.min.js?v=${timestamp}`);
      
      // Wait for widget to be ready
      if (typeof window.D2LoadoutWidget !== 'undefined') {
        console.log('[D2 Loadout Widget] Initializing...');
        window.D2LoadoutWidget.init();
      } else {
        throw new Error('Widget core failed to load');
      }
      
    } catch (error) {
      console.error('[D2 Loadout Widget] Load error:', error);
      
      // Show error message in widget container
      const errorHTML = `
        <div style="padding: 20px; background: rgba(255,68,68,0.1); border: 2px solid #ff4444; border-radius: 8px; color: #ff8888; font-family: sans-serif;">
          <strong>⚠️ D2 Loadout Widget Error</strong><br>
          Failed to load widget: ${error.message}<br>
          <small>Please contact the widget developer</small>
        </div>
      `;
      document.body.innerHTML = errorHTML;
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
