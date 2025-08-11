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

const feedCandidates = new Map();

const mutationObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const addedNode of mutation.addedNodes) {
      if (
        addedNode.nodeType === 1 &&
        addedNode.parentElement &&
        addedNode.style.display !== "none" &&
        addedNode.parentElement.style.display !== "none"
      ) {
        const parent = addedNode.parentElement;

        const parentTag = parent.tagName.toLowerCase();
        const parentClasses = parent.className;
        const key = `${parentTag}.${parentClasses}`;

        if (feedCandidates.has(key)) {
          feedCandidates.set(key, feedCandidates.get(key) + 1);
        } else {
          feedCandidates.set(key, 1);
        }

        scheduleUpdate(); // update the readout panel
      }
    }
  }
});

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

  console.log(feedCandidates);
  updateScheduled = false;
  mutationObserver.observe(document.body, { subtree: true, childList: true });
}

function scheduleUpdate() {
  if (!updateScheduled) {
    updateScheduled = true;
    setTimeout(updateFeedCandidatesPanel, 300);
  }
}

mutationObserver.observe(document.body, { subtree: true, childList: true });

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
