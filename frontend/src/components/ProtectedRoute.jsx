import { Navigate,useLocation } from "react-router-dom";
import {useAuth} from "../context/AuthContext";
export default function ProtectedRoute({children,roles}){
 const {isAuthenticated,isLoading,role}=useAuth(); const location=useLocation();
 if(isLoading)return <div className="page-center">Loading your garden…</div>;
 if(!isAuthenticated)return <Navigate to="/login" state={{from:location}} replace/>;
 if(roles && !roles.includes(role)) return <Navigate to="/dashboard" replace/>;
 return children;
}
