// TODO:
// get initial page height
// monitor when user scrolls a distance equivalent to the initial page height
// if it doesn't work to do a document.load event, then could try to attach an invisible sentinel div to bottom of page, and trigger when it comes into view.
//   However, this may not work if the infinite scroll feed loads new content before the user reaches the bottom of the page.

// Inject a script into the actual page context

export default defineContentScript({
  matches: ["*://*/*"],
  run_at: "document_start",
  async main(context) {
    await injectScript("/injected.js", {
      keepInDom: true,
    });

    if (document.body) {
      console.log("Document body is available");
      initialize();
    } else {
      console.log("Document body is not available yet");
      waitForBody(initialize);
    }

    // TODO: Implement location change monitoring for SPAs
    // Before migrating to WXT, this was done using an injected script
    // However, WXT contains an internal mechanism for handling location changes, need to write that to monitor navigation within SPAs

    // context.addEventListener(window, "wxt:locationchange", (event) => {
    //   console.log(event.newUrl);
    // });
  },
});

function waitForBody(callback) {
  if (document.body) callback();

  const observer = new MutationObserver(() => {
    if (document.body) {
      console.log("MutationObserver triggered");
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function initialize() {
  console.log("Initialize called");

  waitForStableHeight((height) => {
    console.log("Final stable height:", height);
  });

  let scrollY = 0; // current scroll position
  let totalAmountScrolled = 0; // cumulative scroll distance

  // create a readout panel for debugging and dev research purposes
  const scrollReadoutStyle = {
    position: "fixed",
    bottom: "10px",
    left: "10px",
    backgroundColor: "blue",
    border: "1px solid white",
    color: "white",
    padding: "5px",
    zIndex: "1000",
  };

  const scrollReadout = document.createElement("div"); // panel to show info
  document.body.appendChild(scrollReadout);

  const scrollYValue = document.createElement("div");
  scrollYValue.id = "scrollY";
  const scrollYText = document.createTextNode(`Scroll Y: ${scrollY}px`);

  const totalAmountScrolledValue = document.createElement("div");
  totalAmountScrolledValue.id = "totalAmountScrolled";
  const totalAmountScrolledText = document.createTextNode(
    `Total Amount Scrolled: ${totalAmountScrolled}px`
  );

  scrollReadout.append(scrollYValue);
  scrollYValue.append(scrollYText);

  scrollReadout.append(totalAmountScrolledValue);
  totalAmountScrolledValue.append(totalAmountScrolledText);

  for (const [key, value] of Object.entries(scrollReadoutStyle)) {
    scrollReadout.style[key] = value;
  }

  // create a similar panel to readout feed container candidates
  const feedCandidatesReadoutStyle = {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    backgroundColor: "green",
    border: "1px solid white",
    color: "white",
    padding: "5px",
    zIndex: "1000",
  };

  const feedCandidatesTitleStyle = {
    fontWeight: "bold",
    marginBottom: "5px",
  };

  const feedCandidatesReadout = document.createElement("div"); // panel to show feed candidates
  document.body.appendChild(feedCandidatesReadout);

  const feedCandidatesTitle = document.createElement("div");
  feedCandidatesTitle.textContent = "Feed Container Candidates:";
  feedCandidatesReadout.append(feedCandidatesTitle);

  const feedCandidatesList = document.createElement("div");
  feedCandidatesReadout.append(feedCandidatesList);

  for (const [key, value] of Object.entries(feedCandidatesReadoutStyle)) {
    feedCandidatesReadout.style[key] = value;
  }

  for (const [key, value] of Object.entries(feedCandidatesTitleStyle)) {
    feedCandidatesTitle.style[key] = value;
  }

  // watch the DOM for changes upon scrolling
  // try to detect elements that are added to the document
  // infer which element is the feed container by finding parent of elements

  // narrow down parent candidates, and run further checks on parents.
  // filter for parents that have large numbers of similar looking children, eg. <article class="post">, <div class="feed-item">, etc.

  const feedCandidates = new Map();

  let minimumNumberOfChildren = 10; // minimum number of children to consider a parent as a feed container candidate

  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (
          addedNode.nodeType === 1 &&
          isElementVisible(addedNode) &&
          addedNode.parentElement &&
          isElementVisible(addedNode.parentElement) &&
          addedNode.parentElement.children.length > minimumNumberOfChildren
        ) {
          // TODO:
          // is there a standout parent that gets new children added, at a high rate, and in correlation with scroll events?
          // perhaps this could also be done by hooking into XMLHttpRequest or fetch to detect data loads typical of infinite scroll (e.g., a JSON API returning post data).

          const parent = addedNode.parentElement;

          const parentTag = parent.tagName.toLowerCase();
          const parentClasses = parent.className;
          const key = `${parentTag}.${parentClasses}`;

          feedCandidates.set(key, parent.children.length);

          scheduleUpdate(); // update the readout panel
        }
      }
    }
  });

  mutationObserver.observe(document.body, { subtree: true, childList: true });

  // throttle update of debugging panel to reduce memory + resource usage
  let updateScheduled = false;

  function updateFeedCandidatesPanel() {
    mutationObserver.disconnect();
    feedCandidatesList.innerHTML = "";

    for (const [candidateKey, count] of feedCandidates.entries()) {
      const candidateDiv = document.createElement("div");
      candidateDiv.textContent = `${candidateKey}: ${count}`;
      feedCandidatesList.append(candidateDiv);
    }

    updateScheduled = false;
    mutationObserver.observe(document.body, { subtree: true, childList: true });
  }

  function scheduleUpdate() {
    if (!updateScheduled) {
      updateScheduled = true;
      setTimeout(updateFeedCandidatesPanel(), 300);
    }
  }

  // listen for scroll events to update scroll position and total amount scrolled
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY; // that is, the number of pixels the document has already been scrolled vertically
    // const scrollHeight = document.documentElement.scrollHeight; // the height of the entire document
    // const clientHeight = window.innerHeight; // height of window's viewport

    if (window.scrollY !== scrollY) {
      const delta = Math.abs(window.scrollY - scrollY);
      totalAmountScrolled += delta;
      scrollY = window.scrollY;

      scrollYValue.textContent = `Scroll Y: ${scrollY}px`;
      totalAmountScrolledValue.textContent = `Total Amount Scrolled: ${totalAmountScrolled}px`;
    }
  });
}

function waitForStableHeight(callback, timeout = 3000) {
  let lastHeight = 0;
  let stableTimer;

  const observer = new MutationObserver(() => {
    const body = document.body;
    const html = document.documentElement;

    const newHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    if (newHeight !== lastHeight) {
      lastHeight = newHeight;

      clearTimeout(stableTimer);
      stableTimer = setTimeout(() => {
        observer.disconnect();
        callback(newHeight);
      }, timeout);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function isElementVisible(HTMLElement) {
  return (
    HTMLElement.offsetWidth > 0 &&
    HTMLElement.offsetHeight > 0 &&
    getComputedStyle(HTMLElement).visibility !== "hidden" &&
    getComputedStyle(HTMLElement).opacity !== "0" &&
    !HTMLElement.closest("[style*='display: none']")
  );
}
