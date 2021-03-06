import React, { useState, useEffect, useContext } from "react";
import * as msal from "@azure/msal-browser";

const ua = window.navigator.userAgent;
const msie = ua.indexOf("MSIE ");
const msie11 = ua.indexOf("Trident/");
const msedge = ua.indexOf("Edge/");
const isIE = msie > 0 || msie11 > 0;
const isEdge = msedge > 0;

export const MsalContext = React.createContext();
export const useMsal = () => useContext(MsalContext);
export const MsalProvider = ({
                                 children,
                                 config
                             }) => {
    const [isAuthenticated, setIsAuthenticated] = useState();
    const [user, setUser] = useState();
    const [accessToken, setAccessToken] = useState();
    const [idToken, setIdToken] = useState();
    const [publicClient, setPublicClient] = useState();
    const [loading, setLoading] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [loginError, setLoginError] = useState(false);

    useEffect(() => {

        const pc = new msal.PublicClientApplication(config);
        setPublicClient(pc);

        const updateUserFromPublicClient = (pc) => {
            const accounts = pc.getAllAccounts();
            if (accounts.length > 0) {
                setUser(accounts[0]);
                return true;
            } else {
                return false;
            }
        }

        pc.handleRedirectPromise().then((response) =>
        {
            setLoading(false);
            if (response) {
                updateUserFromPublicClient(pc);
                setIsAuthenticated(true);
                if(response.accessToken) {
                    setAccessToken(response.accessToken);
                    setIdToken(response.idToken);
                }
            }
        }).catch(error => {
            console.log(error);
            setLoginError(error);
        });

        if(updateUserFromPublicClient(pc)) {
            setIsAuthenticated(true);
        }

        // eslint-disable-next-line
    }, []);

    const login = async (loginRequest, method) => {
        const signInType = (isIE || isEdge) ? "loginRedirect" : method;
        if (signInType === "loginPopup") {
            setPopupOpen(true);

            try {
                await publicClient.loginPopup(loginRequest);

                if (publicClient.getAccount()) {
                    setUser(publicClient.getAccount());
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.log(error);
                setLoginError(error);
            } finally {
                setPopupOpen(false);
            }
        } else if (signInType === "loginRedirect") {
            setLoading(true);

            publicClient.loginRedirect(loginRequest)
        }
    }

    const logout = () => {
        publicClient.logout();
    }

    const getAccessTokenPopup = async (loginRequest) => {
        try {
            const response = await publicClient.acquireTokenSilent(loginRequest);
            setAccessToken(response.accessToken);
        } catch (error) {
            try {
                setPopupOpen(true);

                const response = await publicClient.acquireTokenPopup(loginRequest);

                setAccessToken(response.accessToken);
            }
            catch (error) {
                console.log(error);
                setLoginError(error);
            }
            finally {
                setPopupOpen(false);
            }
        }
    }

    const getAccessTokenRedirect = async (loginRequest) => {
        try {
            setAccessToken(await publicClient.acquireTokenSilent(loginRequest));
        }
        catch(error) {

            try{
                setLoading(true);

                publicClient.acquireTokenRedirect(loginRequest);
            }
            catch(error) {
                console.log(error);
                setLoginError(error);
            }
        }
    }

    const getAccessToken = async (loginRequest, method) => {
        const signInType = (isIE || isEdge)? "loginRedirect" : method;
        if(signInType === "loginRedirect") {
            return await getAccessTokenRedirect(loginRequest);
        } else
        {
            return await getAccessTokenPopup(loginRequest);
        }
    }

    return (
        <MsalContext.Provider
            value={{
                isAuthenticated,
                user,
                accessToken,
                idToken,
                loading,
                popupOpen,
                loginError,
                login,
                logout,
                getAccessToken
            }}
        >
            {children}
        </MsalContext.Provider>
    );
};