// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, PostUserFragment, getFragment, getFragmentMetadata} from './api';
async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const getButton = document.querySelector("#get");
  const postButton = document.querySelector("#post");
  const getById = document.querySelector("#getbyid");
  const getByInfo = document.querySelector("#getbyid-info")
  // Do an authenticated request to the fragments API server and log the result
  

  // Wire u p event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  getUserFragments(user);
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

getButton.onclick = async () => {
    console.log("Getting fragments");
    
    // Use the checkbox status directly in the function call
    const data = await getUserFragments(user, document.getElementById("expandCheck").checked);

    console.log(data.fragments);

    // Clear the previous list items
    const fragmentsList = document.getElementById('fragments-list');
    fragmentsList.innerHTML = "";

    const ol = document.createElement('ol');

    // Iterate over each fragment and add it to the ordered list
    data.fragments.forEach((element) => {
        const li = document.createElement('li');
        li.textContent = JSON.stringify(element);
        ol.appendChild(li);
    });

    // Append the ordered list to the fragmentsList container
    fragmentsList.appendChild(ol);
};

postButton.onclick = async (event) => {
  event.preventDefault();
  
  var contentType = document.getElementById('mimetype-select').value;
  const content = document.getElementById('fragment-content').value;

  // Check if the selected content type is one of the supported types
  if (["text/plain", "text/markdown", "text/html", "application/json"].includes(contentType)) {
    console.log(`Posting as ${contentType}:`, content);
    
    try {
      const fragId = await PostUserFragment(user, contentType, content); // Single call to a function that posts the data
      
      document.getElementById('fragment-content').value = ""; // Clear the textarea after posting
      alert(`Created a fragment with ID: ${fragId} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('An error occurred while posting the fragment:', error);
      alert('Failed to create the fragment.');
    }
  } else {
    console.error('Unsupported content type. Only "text/plain", "text/markdown", "text/html", and "application/json" are allowed.');
    alert(`Unsupported content type. Please select a valid content type.`);
  }
};


getById.onclick = async () => {
  const value = document.getElementById('fragment-id').value;
  const res = await getFragment(user, value);
  console.log("Res is ", res);

  const fragmentsList = document.getElementById('retrieved-fragment-content');

  if ( res === 'Unsupported Media type, Only (text/plain) is supported[use .txt]' || res == 'Fragment not Found') {
      // Highlighting the error messages
      fragmentsList.innerHTML = `<span style="color:red;">${res}</span>`;
  } else {
      fragmentsList.innerHTML = "Data of Fragment is: ";
      fragmentsList.textContent += JSON.stringify(res);
  }
};
getByInfo.onclick = async() => {
  const value = document.getElementById('fragment-id').value;
  const res = await getFragmentMetadata(user, value);
  console.log("Res is ", JSON.stringify(res));
  const fragmentsList = document.getElementById('retrieved-fragment-content');
 
  if (  res === 'Fragment not Found') {
    // Highlighting the error messages
    fragmentsList.innerHTML = `<span style="color:red;">${JSON.stringify(res)}</span>`;
}
else{
  fragmentsList.innerHTML = "Data of Fragment is: ";
      fragmentsList.innerHTML += JSON.stringify(res)
}

}
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);