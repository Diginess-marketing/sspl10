// Service Worker Unregistration and Cache Clearing Script
// Run this in browser console or include temporarily in your app

(function() {
  'use strict';

  console.log('🔧 Starting service worker unregistration and cache clearing...');

  // Function to unregister all service workers
  function unregisterServiceWorkers() {
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log(`Found ${registrations.length} service worker(s)`);

        const unregisterPromises = registrations.map(registration => {
          console.log(`Unregistering: ${registration.scope}`);
          return registration.unregister().then(success => {
            console.log(`✅ Unregistered: ${registration.scope} - Success: ${success}`);
            return success;
          }).catch(err => {
            console.error(`❌ Failed to unregister ${registration.scope}:`, err);
            return false;
          });
        });

        return Promise.all(unregisterPromises);
      });
    } else {
      console.log('Service Worker API not available');
      return Promise.resolve([]);
    }
  }

  // Function to clear all caches
  function clearAllCaches() {
    if ('caches' in window) {
      return caches.keys().then(names => {
        console.log(`Found ${names.length} cache(s):`, names);

        const deletePromises = names.map(name => {
          console.log(`Deleting cache: ${name}`);
          return caches.delete(name).then(success => {
            console.log(`✅ Cache deleted: ${name} - Success: ${success}`);
            return success;
          }).catch(err => {
            console.error(`❌ Failed to delete cache ${name}:`, err);
            return false;
          });
        });

        return Promise.all(deletePromises);
      });
    } else {
      console.log('Cache API not available');
      return Promise.resolve([]);
    }
  }

  // Function to clear browser storage
  function clearStorage() {
    const clearPromises = [];

    // Clear localStorage
    if (window.localStorage) {
      try {
        localStorage.clear();
        console.log('✅ localStorage cleared');
      } catch (err) {
        console.error('❌ Failed to clear localStorage:', err);
      }
    }

    // Clear sessionStorage
    if (window.sessionStorage) {
      try {
        sessionStorage.clear();
        console.log('✅ sessionStorage cleared');
      } catch (err) {
        console.error('❌ Failed to clear sessionStorage:', err);
      }
    }

    return Promise.resolve();
  }

  // Function to reload the page
  function reloadPage() {
    console.log('🔄 Reloading page in 2 seconds...');
    setTimeout(() => {
      window.location.reload(true); // Force reload from server
    }, 2000);
  }

  // Main execution
  Promise.all([
    unregisterServiceWorkers(),
    clearAllCaches(),
    clearStorage()
  ]).then(results => {
    const [swResults, cacheResults, storageResults] = results;

    console.log('🎉 Cleanup completed!');
    console.log('Service Workers:', swResults);
    console.log('Caches:', cacheResults);

    // Show summary
    const totalSW = swResults.length;
    const successfulSW = swResults.filter(Boolean).length;
    const totalCaches = cacheResults.length;
    const successfulCaches = cacheResults.filter(Boolean).length;

    console.log(`📊 Summary: ${successfulSW}/${totalSW} SW unregistered, ${successfulCaches}/${totalCaches} caches cleared`);

    // Reload page
    reloadPage();

  }).catch(err => {
    console.error('❌ Cleanup failed:', err);
    // Still try to reload
    reloadPage();
  });

})();