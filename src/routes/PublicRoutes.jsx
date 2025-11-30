/* routes/PublicRoutes.jsx */
import { Route } from "react-router-dom";
import AuthLogin from "../pages/Authentication/auth-login";
import Signup from "../pages/Authentication/auth-signup";
import AuthResetPassword from "../pages/Authentication/auth-re-password";
import AuthNewPassword from "../pages/Authentication/auth-new-password";
import AuthLockScreen from "../pages/Authentication/auth-lock-screen";
import AuthNotAccess from "../pages/Authentication/auth-not-access";
import AuthActivateAccount from "../pages/Authentication/auth-activated";
import ErrorPage from "../pages/error";

export const publicRoutes = (
  <>
    <Route path="/auth/login" element={<AuthLogin />} />
    <Route path="/auth/signup" element={<Signup />} />
    <Route path="/auth/re-password" element={<AuthResetPassword />} />
    <Route path="/auth/new-password" element={<AuthNewPassword />} />
    <Route path="/auth/lock-screen" element={<AuthLockScreen />} />
    <Route path="/auth/not-access" element={<AuthNotAccess />} />
    <Route path="/auth/activate" element={<AuthActivateAccount />} />
    <Route path="/error-page" element={<ErrorPage />} />
  </>
);
