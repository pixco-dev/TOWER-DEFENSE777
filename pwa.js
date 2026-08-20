(() => {
  const installButton = document.getElementById("install-app-btn");
  const installPanel = document.getElementById("install-panel");
  const closeButton = document.getElementById("install-close-btn");
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let installPrompt = null;

  function showInstallButton() {
    if (!standalone) installButton?.classList.remove("hidden");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton?.classList.add("hidden");
    installPanel?.classList.add("hidden");
  });

  if (ios) showInstallButton();

  installButton?.addEventListener("click", async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      return;
    }
    installPanel?.classList.remove("hidden");
  });

  closeButton?.addEventListener("click", () => installPanel?.classList.add("hidden"));

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });

    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
        registration.update();
      } catch (error) {
        console.warn("Offline app setup failed", error);
      }
    });
  }
})();
