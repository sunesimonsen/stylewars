const id = "stylewars";
export default function getStyleElement() {
  let styleElement = document.getElementById(id);

  if (styleElement) return styleElement;

  styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  styleElement.setAttribute("id", id);
  styleElement.hashes = new Map();
  styleElement.positions = new Map();
  styleElement.counter = 1;
  document.head.appendChild(styleElement);

  return styleElement;
}
