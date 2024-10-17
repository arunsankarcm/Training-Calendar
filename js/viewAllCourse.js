const menuButton = document.getElementById('menuButton');
const popupMenu = document.getElementById('popupMenu');

// Toggle menu visibility on button click
menuButton.addEventListener('click', (e) => {
  e.stopPropagation();
  popupMenu.style.display = popupMenu.style.display === 'block' ? 'none' : 'block';
});

// Hide the popup if clicked outside
document.addEventListener('click', (e) => {
  if (popupMenu.style.display === 'block') {
    popupMenu.style.display = 'none';
  }
});

// ---------------------------------------------


const iconButton = document.getElementById('iconButton');
const popupMenuFilter = document.getElementById('popupMenuFilter');

// Toggle menu visibility on button click
iconButton.addEventListener('click', (e) => {
  e.stopPropagation();
  popupMenuFilter.style.display = popupMenuFilter.style.display === 'block' ? 'none' : 'block';
});

// Hide the popup if clicked outside
document.addEventListener('click', (e) => {
  if (popupMenuFilter.style.display === 'block') {
    popupMenuFilter.style.display = 'none';
  }
});

