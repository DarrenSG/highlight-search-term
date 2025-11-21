/**
 * Highlight search term in the selected elements
 *
 * @example
 * import { highlightSearchTerm } from "highlight-search-term";
 * const search = document.getElementById("search");
 * search.addEventListener("input", () => {
 *   highlightSearchTerm({ search: search.value, selector: ".content" });
 * });
 */
const highlightSearchTerm = ({
  search,
  selector,
  customHighlightName = "search",
}) => {
  if (!selector) {
    throw new Error("The selector argument is required");
  }

  if (!CSS.highlights) return; // disable feature on Firefox as it does not support CSS Custom Highlight API

  // remove previous highlight
  CSS.highlights.delete(customHighlightName);
  if (!search) {
    // nothing to highlight
    return;
  }
  // find all text nodes containing the search term
  const ranges = [];
  try {
    const elements = document.querySelectorAll(selector);
    Array.from(elements).forEach((element) => {
      getTextNodesInElementContainingText(element, search).forEach((node) => {
        ranges.push(...getRangesForSearchTermInTextNode(node, search));
      });
    });
  } catch (error) {
    console.error(error);
  }
  if (ranges.length === 0) return;
  // create a CSS highlight that can be styled with the ::highlight(search) pseudo-element
  const highlight = new Highlight(...ranges);
  CSS.highlights.set(customHighlightName, highlight);
};

const getTextNodesInElementContainingText = (element, text) => {
  const lowerCaseText = text.toLowerCase();
  const nodes = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent?.toLowerCase().includes(lowerCaseText)) {
      nodes.push(node);
    }
  }
  return nodes;
};

const getRangesForSearchTermInTextNode = (textNode, search) => {
  const ranges = [];
  const lowerCaseSearch = search.toLowerCase();
  const text = textNode.textContent?.toLowerCase() || "";
  let start = 0;
  let index;
  while ((index = text.indexOf(lowerCaseSearch, start)) >= 0) {
    const range = new Range();
    range.setStart(textNode, index);
    range.setEnd(textNode, index + search.length);
    ranges.push(range);
    start = index + search.length;
  }
  return ranges;
};

export { highlightSearchTerm };
