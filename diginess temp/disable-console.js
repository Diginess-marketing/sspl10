/**
 * Console Suppression Script
 * Disables all console methods globally
 * This runs before any other scripts to prevent debug messages
 */
(function() {
  'use strict';
  
  // Check if console should be disabled (always disabled except in explicit debug mode)
  const enableConsole = new URLSearchParams(window.location.search).get('debug') === 'true';
  
  if (!enableConsole) {
    // Store original console methods (optional, for potential restoration)
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      trace: console.trace,
      dir: console.dir,
      dirxml: console.dirxml,
      group: console.group,
      groupEnd: console.groupEnd,
      time: console.time,
      timeEnd: console.timeEnd,
      assert: console.assert,
      profile: console.profile
    };
    
    // Create no-op function
    const noop = function() {};
    
    // Override all console methods with no-op
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;
    console.debug = noop;
    console.trace = noop;
    console.dir = noop;
    console.dirxml = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.timeLog = noop;
    console.assert = noop;
    console.profile = noop;
    console.profileEnd = noop;
    console.count = noop;
    console.countReset = noop;
    console.table = noop;
    console.clear = noop;
    
    // Expose restore function (optional, for debugging)
    window.__restoreConsole = function() {
      Object.assign(console, originalConsole);
    };
  }
})();
