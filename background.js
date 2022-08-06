try {
  // Where we will expose all the data we retrieve from storage.sync.
  const storageCache = { redirectTo: "i" };
  // Asynchronously retrieve data from storage.sync, then cache it.
  const initStorageCache = getAllStorageSyncData().then((items) => {
    // Copy the data retrieved from storage into storageCache.
    Object.assign(storageCache, items);
  });

  const handleRedirectChange = async () => {
    try {
      await initStorageCache;
      const { redirectTo } = storageCache;

      let newRedirectTo = "";
      let newBackgroundColor;
      if (redirectTo === "i") {
        newRedirectTo = "old";
      } else if (redirectTo === "old") {
        newRedirectTo = "new";
      } else {
        newRedirectTo = "i";
      }

      if (newRedirectTo === "i") {
        newBackgroundColor = [241, 241, 241, 100];
      } else if (newRedirectTo === "old") {
        newBackgroundColor = [206, 227, 248, 100];
      } else {
        newBackgroundColor = [255, 69, 0, 100];
      }

      chrome.storage.sync.set({ redirectTo: newRedirectTo }, async () => {
        console.log("Redirect target now set to ", newRedirectTo);
        storageCache.redirectTo = newRedirectTo;

        // change d rules
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ["i", "old", "new"],
          enableRulesetIds: [newRedirectTo],
        });

        // change the icon values
        chrome.action.setBadgeBackgroundColor({ color: newBackgroundColor });
        chrome.action.setBadgeText({ text: newRedirectTo });
      });
    } catch (e) {
      // Handle error that occurred during storage initialization.
      console.error(e);
    }
  };

  chrome.runtime.onInstalled.addListener(handleRedirectChange);
  chrome.action.onClicked.addListener(handleRedirectChange);

  // Reads all data out of storage.sync and exposes it via a promise.
  //
  // Note: Once the Storage API gains promise support, this function
  // can be greatly simplified.
  function getAllStorageSyncData() {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
      // Asynchronously fetch all data from storage.sync.
      chrome.storage.sync.get(null, (items) => {
        // Pass any observed errors down the promise chain.
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        // Pass the data retrieved from storage down the promise chain.
        resolve(items);
      });
    });
  }
} catch (e) {
  console.error(e);
}
