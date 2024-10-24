// const iconButton = document.getElementById('iconButton');
// const popupMenuFilter = document.getElementById('popupMenuFilter');

// // Toggle menu visibility on button click
// iconButton.addEventListener('click', (e) => {
//   e.stopPropagation();
//   popupMenuFilter.style.display = popupMenuFilter.style.display === 'block' ? 'none' : 'block';
// });

// // Hide the popup if clicked outside
// document.addEventListener('click', (e) => {
//   if (popupMenuFilter.style.display === 'block') {
//     popupMenuFilter.style.display = 'none';
//   }
// });

 // Retrieve success message from sessionStorage
 const successMessage = sessionStorage.getItem('successMessage');

 // Check if a success message exists and display it
 if (successMessage) {
     const messageElement = document.getElementById('message');
     messageElement.textContent = successMessage;

     // Clear the message after 3 seconds with animation
     setTimeout(() => {
         messageElement.classList.add('fade-out'); // Add fade-out class

         // After the animation duration, remove the message completely
         setTimeout(() => {
             sessionStorage.removeItem('successMessage'); // Clear from sessionStorage
             messageElement.textContent = ''; // Clear message text
         }, 1000); 
     }, 1500); 
 }








