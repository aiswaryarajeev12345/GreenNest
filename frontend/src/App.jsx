import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";



import AdminDashboard from "./pages/AdminDashboard";
import AdminMonitor from "./pages/AdminMonitor";


import Community from "./pages/Community";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";


import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import SellerProduct from "./pages/SellerProduct";



import Exchange from "./pages/Exchange";



import Classes from "./pages/Classes";
import ExpertClassForm from "./pages/ExpertClassForm";



import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";



import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";



import SellerDashboard from "./pages/SellerDashboard";



import "./styles/theme.css";
import "./styles/auth.css";
import "./styles/profile.css";




function Guest({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}




export default function App() {
  return (
    <Router>

      <div className="app">

 
        <Navbar />

        <main>

          <Routes>

       

            <Route
              path="/"
              element={
                <Home />
              }
            />

            <Route
              path="/login"
              element={
                <Guest>
                  <Login />
                </Guest>
              }
            />

            <Route
              path="/register"
              element={
                <Guest>
                  <Register />
                </Guest>
              }
            />


        

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />




            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-monitor"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminMonitor />
                </ProtectedRoute>
              }
            />


           

            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />

            <Route
              path="/community/create"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />

            <Route
              path="/community/posts/:id"
              element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              }
            />



            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/marketplace/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />


     
            <Route
              path="/seller/products/new"
              element={
                <ProtectedRoute
                  roles={["GROWER", "SELLER"]}
                >
                  <SellerProduct />
                </ProtectedRoute>
              }
            />


            <Route
              path="/seller/products/:id/edit"
              element={
                <ProtectedRoute
                  roles={["GROWER", "SELLER"]}
                >
                  <SellerProduct />
                </ProtectedRoute>
              }
            />


      

            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute
                  roles={["GROWER", "SELLER"]}
                >
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />


 

            <Route
              path="/exchange"
              element={
                <ProtectedRoute>
                  <Exchange />
                </ProtectedRoute>
              }
            />


          

            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              }
            />


            <Route
              path="/expert/classes/new"
              element={
                <ProtectedRoute roles={["EXPERT"]}>
                  <ExpertClassForm />
                </ProtectedRoute>
              }
            />

  

            <Route
              path="/expert/classes/:id/edit"
              element={
                <ProtectedRoute roles={["EXPERT"]}>
                  <ExpertClassForm />
                </ProtectedRoute>
              }
            />


 
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />


     

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />


            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />


           

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </main>

       

        <Footer />

      </div>

    </Router>
  );
}