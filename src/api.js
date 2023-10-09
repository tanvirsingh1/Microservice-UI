// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user,expand= false) {
   
  console.log('Requesting user fragments data...');
  let url = `${apiUrl}/v1/fragments`;
  if (expand) {
    url += '?expand=1';
  }
  try {

    const res = await fetch(url, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments data', { data });
    return data
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

export async function PostUserFragment( userInfo, mimeType, fragmentData) {

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userInfo.idToken}`,
      "Content-Type": mimeType,
    },
    body: fragmentData,
  };

  try {
    const response = await fetch(`${apiUrl}/v1/fragments`, requestOptions);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Submitted user fragment", responseData);
    return responseData.fragments.id
  } catch (error) {
    console.error("Failed to submit fragment", error);
  }
}

export async function getFragment(user, id) {
  console.log("Requesting user fragments data...");
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      headers: user.authorizationHeaders(),
    });

    // Check for Unsupported Media Type
    if (res.status === 415) {
      const Unsupported_Type = await res.json();
      return Unsupported_Type.message;
    }
    
    // Check for Successful Response
    if (res.status === 200) {
      const headers = res.headers.get("content-type");
      if (headers && headers.includes("text/plain")) {
        return await res.text();
      }
    }
    
    // Handle other non-successful responses
    try {
      const error = await res.json();
      console.log(`Error is ${error}`);
      return error.message;
    } catch (jsonError) {
      throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
    }

  } catch (err) {
    console.error("Unable to call GET /v1/fragment", { err });
    throw err; // Propagate the error to the calling function
  }
}
