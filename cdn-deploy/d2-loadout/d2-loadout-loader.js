/**
 * D2 Loadout Widget - CDN Loader Script
 * Notice Me Senpai Studio
 * 
 * This script dynamically loads the widget's CSS and JavaScript files
 * with cache-busting timestamps to ensure users always get the latest version.
 */

(function() {
    'use strict';
    
    // CDN Base URL
    const CDN_BASE = 'https://cdn.noticemesenpai.studio/d2-loadout';
    
    // Generate cache-busting timestamp
    const timestamp = Date.now();
    
    /**
     * Dynamically load a CSS file
     */
    function loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
            document.head.appendChild(link);
        });
    }
    
    /**
     * Dynamically load a JavaScript file
     */
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Initialize the widget by loading all required resources
     */
    async function initializeWidget() {
        try {
            console.log('[D2 Loadout Widget] Loading resources from CDN...');
            
            // Load CSS first for immediate styling
            await loadCSS(`${CDN_BASE}/d2-loadout-widget.css?v=${timestamp}`);
            console.log('[D2 Loadout Widget] CSS loaded successfully');
            
            // Load JavaScript
            await loadScript(`${CDN_BASE}/d2-loadout-widget.js?v=${timestamp}`);
            console.log('[D2 Loadout Widget] JavaScript loaded successfully');
            
            console.log('[D2 Loadout Widget] All resources loaded - widget ready!');
            
        } catch (error) {
            console.error('[D2 Loadout Widget] Failed to load resources:', error);
            
            // Display error message to user
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                z-index: 999999;
                max-width: 500px;
            `;
            errorDiv.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">❌ D2 Loadout Widget Error</h3>
                <p style="margin: 0 0 10px 0;">Failed to load widget resources from CDN.</p>
                <p style="margin: 0; font-size: 12px; opacity: 0.9;">
                    Check your internet connection or contact support at:<br>
                    <strong>contact@noticemesenpai.studio</strong>
                </p>
                <pre style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.8; white-space: pre-wrap;">${error.message}</pre>
            `;
            document.body.appendChild(errorDiv);
        }
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }
    
})();
