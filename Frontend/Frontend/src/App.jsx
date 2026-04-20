import { Routes, Route, Navigate, useLocation } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import ProfilePage from "./pages/ProfilePage";
import Admin from "./pages/Admin";
import ProblemPage from "./pages/ProblemPage";
import AdminPanel from "./components/AdminPanel";
import AdminDelete from "./components/AdminDelete";
import UpdateProblem from "./components/UpdateProblem";
import AdminUpdate from "./components/UpdateProblem";
import ChatAi from "./components/ChatAi";
import Footer from "./pages/Footer";
import { checkAuth } from "./authSlice";
import Layout from "./components/Layout"; // Import the Layout component

import AdminVideo from "./components/AdminVideo"

import AdminUpload from "./components/AdminUpload"

// import courses from "./pages/CoursesPage"
import CoursesPage from "./pages/CoursesPage";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import CourseContentPage from "./pages/CourseContentPage";
import Contest from "./pages/Contest";
import ContestDetail from "./pages/ContestDetail";
import Leaderboard from "./pages/Leaderboard";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/Contact";
import InterviewPrepStudio from "./pages/InterviewPrepStudio";
import LoadingPage from "./components/LoadingPage";
import DocumentationPage from "./pages/doc";
import VerifyCertificate from "./pages/VerifyCertificate";




function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <>
      <LoadingPage></LoadingPage>
      </>
    );
  }

  const hideFooterRoutes = ['/login', '/signup'];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
        
        {/* Public route for certificate verification */}
        <Route path="/verify-certificate/:certId" element={
          <Layout>
            <VerifyCertificate />
          </Layout>
        } />
        <Route path="/verify-certificate" element={
          <Layout>
            <VerifyCertificate />
          </Layout>
        } />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          isAuthenticated ? (
            <Layout>
              <Homepage />
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />

        

         <Route path="/courses" element={
          isAuthenticated ? (
            <Layout>
              <CoursesPage />
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />

        <Route path="/documentation" element={
          isAuthenticated ? (
            <Layout>
              <DocumentationPage />
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />


        <Route path="/courses/:courseId" element={
  isAuthenticated ? (
    <Layout>
      <CourseOverviewPage />
    </Layout>
  ) : (
    <Navigate to="/signup" />
  )
} />
        

      
   <Route path="/courses/:courseId/lecture/:lectureId" element={
  isAuthenticated ? (
    <Layout>
      <CourseContentPage/>
    </Layout>
  ) : (
    <Navigate to="/signup" />
  )
} />

          <Route path="/leaderboard" element={
          isAuthenticated ? (
            <Layout>
              <Leaderboard />
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />

          <Route path="/about" element={
          isAuthenticated ? (
            <Layout>
              <AboutUs/>
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />


 <Route path="/interview" element={
          isAuthenticated ? (
            <Layout>
              <InterviewPrepStudio/>
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />


          <Route path="/privacy" element={
          isAuthenticated ? (
            <Layout>
              <PrivacyPolicyPage/>
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />
        

          <Route path="/contest" element={
          isAuthenticated ? (
            <Layout>
              <Contest />
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />

        <Route path="/contest/:id" element={
          isAuthenticated ? (
            <Layout>
              <ContestDetail />
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />

        <Route path="/contact" element={
          isAuthenticated ? (
            <Layout>
              <ContactPage />
            </Layout>
          ) : (
            <Navigate to="/signup" />
          )
        } />



     






      


        <Route path="/profile" element={
          <Layout>
            <ProfilePage />
          </Layout>
        } />
        
        <Route path="/admin" element={
          isAuthenticated && user?.role === 'admin' ? (
            <Layout>
              <Admin />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/admin/create" element={
          isAuthenticated && user?.role === 'admin' ? (
            <Layout>
              <AdminPanel />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/admin/delete" element={
          isAuthenticated && user?.role === 'admin' ? (
            <Layout>
              <AdminDelete />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/admin/update" element={
          isAuthenticated && user?.role === 'admin' ? (
            <Layout>
              <UpdateProblem />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/admin/update/:id" element={
          isAuthenticated && user?.role === 'admin' ? (
            <Layout>
              <AdminUpdate />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path="/admin/video" element={
          isAuthenticated && user?.role === 'admin' ? (
            <Layout>
              <AdminVideo />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />

        
         <Route path="/admin/upload/:problemId" element={
          isAuthenticated && user?.role === 'admin' ? (
            <Layout>
              <AdminUpload />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        } />

        
        <Route path="/problem/:problemId" element={
          <Layout>
            <ProblemPage />
          </Layout>
        } />
        
        <Route path="/chat" element={
          isAuthenticated ? (
            <Layout>
              <ChatAi />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>

      

      {shouldShowFooter && <Footer />}
    </>
  );
}

export default App;