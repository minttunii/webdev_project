/**
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

const form = document.querySelector('form');

form.addEventListener("submit", function(event){
    event.preventDefault();

    const formData = new FormData(form);
    console.log(formData);

    if(formData.get('password') !== formData.get('passwordConfirmation')){
        console.log('Passwords dont match!');
    }
})

