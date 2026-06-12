import './style.css';
import { BubbleWall } from './core/BubbleWall.js';
import { initialItems } from './data/initialItems.js';
import { setupLayoutToggle } from './ui/controls.js';
import { setupSearch } from './ui/search.js';

const layer = document.querySelector('#bubbleLayer');
const layoutToggle = document.querySelector('#layoutToggle');
const searchToggle = document.querySelector('#searchToggle');
const searchPanel = document.querySelector('#searchPanel');
const searchInput = document.querySelector('#bubbleSearch');

const bubbleWall = new BubbleWall({
  layer,
  items: initialItems
});

setupLayoutToggle({ bubbleWall, layoutToggle });
setupSearch({ bubbleWall, searchToggle, searchPanel, searchInput });

window.bubbleWall = {
  addBubble: (data) => bubbleWall.addBubble(data),
  getBubbles: () => bubbleWall.getBubbles(),
  setLayoutMode: (mode) => bubbleWall.setLayoutMode(mode),
  search: (value) => bubbleWall.search(value)
};
