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










