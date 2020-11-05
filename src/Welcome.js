import React from "react";
import { useMsal } from "./auth/msal-context";
import { apiRequest } from "./auth/auth-config";

const Welcome = () => {
  const { user, logout, getAccessToken, accessToken, idToken, loginError } = useMsal();

  return (
    <div>
      <h1>Welcome {user.userName}</h1>
      {accessToken && (<span>Your token is {accessToken}</span>)}
      <br/> <br/>
      {idToken && (<span>Your id token is {idToken}</span>)}
      <br/> <br/>
      <button onClick={() => getAccessToken(apiRequest, "loginPopup")}>Get Token</button>
      <br/>
      <button onClick={() => logout()}>Log out</button>
      <br/>
      {loginError && (<span>Error: {loginError.message}</span>)}
    </div>
  );
};

export default Welcome;