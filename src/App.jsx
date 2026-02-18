import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Componets/Navbar';
import Footer from './Componets/Footer';
import Home from './Componets/Pages/Home';
import About from './Componets/Pages/About';
import Courses from './Componets/Pages/Courses';
import Admission from './Componets/Pages/Admission';
import BeltExam from './Componets/Pages/BeltExam';
import Contact from './Componets/Pages/Contact';
import ClubRules from './Componets/Pages/ClubRules';
import { useScrollToTop } from './utils/useScrollToTop';

// Admin Components
import AdminLogin from './Componets/Admin/AdminLogin';
import AdminLayout from './Componets/Admin/AdminLayout';
import DashboardHome from './Componets/Admin/Dashboard/DashboardHome';
import AdmissionManagement from './Componets/Admin/Dashboard/AdmissionManagement';
import BeltExamManagement from './Componets/Admin/Dashboard/BeltExamManagement';
import BannerManagement from './Componets/Admin/Dashboard/BannerManagement';
import AttendanceTracking from './Componets/Admin/Dashboard/AttendanceTracking';
import BeltManagement from './Componets/Admin/Dashboard/BeltManagement';
import EventManagement from './Componets/Admin/Dashboard/EventManagement';
import FeeManagement from './Componets/Admin/Dashboard/FeeManagement';
import CertificationManagement from './Componets/Admin/Dashboard/CertificationManagement';
import AchievementManagement from './Componets/Admin/AchievementManagement';
import TemplateManagement from './Componets/Admin/TemplateManagement';
import StudentManagement from './Componets/Admin/StudentManagement';
import ContactManagement from './Componets/Admin/ContactManagement';
import CourseManagement from './Componets/Admin/CourseManagement';
import StudentAchievements from './Componets/Student/StudentAchievements';
import CertificateVerification from './Componets/Pages/CertificateVerification';
import Membership from './Componets/Membership';

// Layout wrapper component that includes scroll-to-top functionality
function PublicLayout({ children }) {
  useScrollToTop(); // This will scroll to top on route changes
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        } />
        
        <Route path="/about" element={
          <PublicLayout>
            <About />
          </PublicLayout>
        } />
        
        <Route path="/courses" element={
          <PublicLayout>
            <Courses />
          </PublicLayout>
        } />
        
        <Route path="/membership" element={
          <PublicLayout>
            <Membership />
          </PublicLayout>
        } />
        
        <Route path="/admission" element={
          <PublicLayout>
            <Admission />
          </PublicLayout>
        } />
        
        <Route path="/belt-exam" element={
          <PublicLayout>
            <BeltExam />
          </PublicLayout>
        } />
        
        <Route path="/contact" element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        } />

        <Route path="/club-rules" element={
          <PublicLayout>
            <ClubRules />
          </PublicLayout>
        } />

        {/* Certificate Verification - Public Route */}
        <Route path="/verify-certificate" element={
          <PublicLayout>
            <CertificateVerification />
          </PublicLayout>
        } />

        {/* Student Portal */}
        <Route path="/student/achievements" element={
          <PublicLayout>
            <StudentAchievements />
          </PublicLayout>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="attendance" element={<AttendanceTracking />} />
          <Route path="belts" element={<BeltManagement />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="certificates" element={<CertificationManagement />} />
          <Route path="admissions" element={<AdmissionManagement />} />
          <Route path="belt-exams" element={<BeltExamManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="contacts" element={<ContactManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="achievements" element={<AchievementManagement />} />
          <Route path="templates" element={<TemplateManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

