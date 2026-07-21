import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CapabilitiesPage from './pages/CapabilitiesPage';
import PeoplePage from './pages/PeoplePage';
import PersonDetailPage from './pages/PersonDetailPage';
import KnowledgePage from './pages/KnowledgePage';
import InsightDetailPage from './pages/InsightDetailPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import MissionPage from './pages/MissionPage';
import VisionPage from './pages/VisionPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminUnlockGate from './components/AdminUnlockGate';
import CapabilityDetailPage from './pages/CapabilityDetailPage';
import ArticleEditorPage from './pages/ArticleEditorPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

export default function App() {
  return (
    <>
      <AdminUnlockGate />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route
            path="news/add"
            element={
              <ProtectedAdminRoute>
                <ArticleEditorPage kind="news" />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="news/edit"
            element={
              <ProtectedAdminRoute>
                <ArticleEditorPage kind="news" action="edit" />
              </ProtectedAdminRoute>
            }
          />
          <Route path="news/:slug" element={<NewsDetailPage />} />
          <Route path="services" element={<CapabilitiesPage />} />
          <Route path="services/:id" element={<CapabilityDetailPage />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="people/:id" element={<PersonDetailPage />} />
          <Route path="insight" element={<KnowledgePage />} />
          <Route
            path="insight/add"
            element={
              <ProtectedAdminRoute>
                <ArticleEditorPage kind="insight" />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="insight/edit"
            element={
              <ProtectedAdminRoute>
                <ArticleEditorPage kind="insight" action="edit" />
              </ProtectedAdminRoute>
            }
          />
          <Route path="insight/:slug" element={<InsightDetailPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="mission" element={<MissionPage />} />
          <Route path="vision" element={<VisionPage />} />
          <Route path="capabilities" element={<Navigate to="/services" replace />} />
          <Route path="knowledge" element={<Navigate to="/insight" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
