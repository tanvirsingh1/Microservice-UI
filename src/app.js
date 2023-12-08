// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, PostUserFragment, getFragment, getFragmentMetadata, deleteFragment, putFragment} from './api';
async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const getButton = document.querySelector("#get");
  const postButton = document.querySelector("#post");
  const getById = document.querySelector("#getbyid");
  const getByInfo = document.querySelector("#getbyid-info")
  const deleteBtn = document.querySelector("#delete")
  const updatebtn = document.querySelector('#update')

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
  }else if (contentType.startsWith('image/')) {
    const photoInput = document.getElementById('photoInput');
    const file = photoInput.files[0];

    if (file) {
      try {
        const fragId = await PostUserFragment(user, contentType, file);
        alert(`Created a fragment with ID: ${fragId} at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('An error occurred while posting the image:', error);
        alert('Failed to create the image fragment.');
      }
    } else {
      alert('Please select an image to upload.');
    }
  } else {
    alert('Unsupported content type.');
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
  }
  else if (res instanceof Blob) {
    console.log("Url is ",URL.createObjectURL(res) )
    var htmlSegment = `<div class="convertedFragment">
      <img src="${URL.createObjectURL(res)}" alt="Image Fragment"></img>
    </div>`;
    const imageElement = document.getElementById('image');
    fragmentsList.innerHTML = htmlSegment; 
  }
  else {
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
deleteBtn.onclick = async () => {
  const value = document.getElementById('delete-fragment-id').value;
  const result = await deleteFragment(user, value);
  const fragmentsList = document.getElementById('delete-fragment-id');
 
  console.log("result is ",result)
    // Successful deletion
    if(result.status === "ok"){
    document.getElementById('delete-fragment-id').value ="Sucessfully Deleted Fragment";
    document.getElementById('delete-fragment-id').style.color = 'green';
    }
    else{
    // Error during deletion
 
    document.getElementById('delete-fragment-id').value = "Invalid ID, not Found!"
    document.getElementById('delete-fragment-id').style.color = 'red';
    }
  
};

updatebtn.onclick = async () => {
  const ID = document.getElementById('update-fragment-id').value;
  var contentType = document.getElementById('update-fragment-content-type').value;
  var content = document.getElementById("update-fragment-content").value
  if (["text/plain", "text/markdown", "text/html", "application/json"].includes(contentType)) {
    try{
   const result = await putFragment(
      user,ID, contentType, content
    );
    console.log("result is ",result)
    var Presult = JSON.parse(result)
   
      document.getElementById('update-fragment-id').value = "Fragment Updated";
      document.getElementById('update-fragment-id').style.color = 'green';
      }
      catch(err) {
      // Error during deletion
   
      document.getElementById('update-fragment-id').value = err.message
      document.getElementById('update-fragment-id').style.color = 'red';
      }

  }
  
  else if (contentType.startsWith('image/')) {
    const photoInput = document.getElementById('photoInput2');
    const file = photoInput.files[0];

    if (file) {
      try {
        const fragId = await putFragment(user,ID, contentType, file);
      
      } catch (error) {
        console.error('An error occurred while updating the image:', error);
        alert('Failed to update the image fragment.');
      }
    } else {
      alert('Please select an image to upload.');
    }
  }
  else {
    console.error('Unsupported content type. Only "text/plain", "text/markdown", "text/html", and "application/json" are allowed.');
    alert(`Unsupported content type. Please select a valid content type.`);
  }
  
};


}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);