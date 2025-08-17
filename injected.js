(function () {
  const pushState = history.pushState;
  const replaceState = history.replaceState;

  function dispatchNavEvent(type) {
    window.dispatchEvent(
      new CustomEvent("spa-navigation", { detail: { type } })
    );
    console.log("[SPA DETECTOR] Navigation event:", type);
  }

  function wrap(fn, type) {
    return function (...args) {
      const result = fn.apply(this, args);
      dispatchNavEvent(type);
      return result;
    };
  }

  history.pushState = wrap(pushState, "pushState");
  history.replaceState = wrap(replaceState, "replaceState");

  window.addEventListener("popstate", () => dispatchNavEvent("popstate"));

  // Fire once on initial load
  dispatchNavEvent("load");
})();
