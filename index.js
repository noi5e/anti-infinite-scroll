let scrollY = 0; // current scroll position
let totalAmountScrolled = 0; // cumulative scroll distance

// create a readout panel for debugging and dev research purposes
const readoutStyle = {
  position: "fixed",
  bottom: "10px",
  left: "10px",
  backgroundColor: "blue",
  border: "1px solid white",
  color: "white",
  padding: "5px",
};

const readout = document.createElement("div"); // panel to show info
document.body.appendChild(readout);

const scrollYValue = document.createElement("div");
scrollYValue.id = "scrollY";
const scrollYText = document.createTextNode(`Scroll Y: ${scrollY}px`);

const totalAmountScrolledValue = document.createElement("div");
totalAmountScrolledValue.id = "totalAmountScrolled";
const totalAmountScrolledText = document.createTextNode(
  `Total Amount Scrolled: ${totalAmountScrolled}px`
);

readout.append(scrollYValue);
scrollYValue.append(scrollYText);

readout.append(totalAmountScrolledValue);
totalAmountScrolledValue.append(totalAmountScrolledText);

for (const [key, value] of Object.entries(readoutStyle)) {
  readout.style[key] = value;
}

// watch the DOM for changes upon scrolling
// try to detect elements that are added to the document
// infer which element is the feed container by finding parent of elements

const feedCandidates = new Set();

const mutationObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const addedNode of mutation.addedNodes) {
      if (addedNode.nodeType === 1) {
        // console.log(addedNode);
        // console.log(scrollY);
        // console.log(addedNode.parentElement);
      }
    }
  }
});

mutationObserver.observe(document.body, { subtree: true, childList: true });

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
