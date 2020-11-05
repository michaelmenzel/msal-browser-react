import React from "react";
import { useMsal } from "./auth/msal-context";
import { apiRequest } from "./auth/auth-config";

const Welcome = () => {
  const { user, logout, getAccessToken, accessToken, loginError } = useMsal();

  return (
    <div>
      <h1>Welcome {user.userName}</h1>
      {accessToken && (<span>Your token is {accessToken}</span>)}
      <br></br>
      <button onClick={() => getAccessToken(apiRequest, "loginPopup")}>Get Token</button>
      <br></br>
      <button onClick={() => logout()}>Log out</button>
      <br></br>
      {loginError && (<span>Error: {loginError.message}</span>)}
    </div>
  );
};

export default Welcome;