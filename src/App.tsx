import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { CategoryPage } from './pages/CategoryPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToolPage } from './pages/ToolPage';
import { WebNavigationPage } from './pages/WebNavigationPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<WebNavigationPage />} />
        <Route path="navigation" element={<Navigate to="/" replace />} />
        <Route path="tools" element={<HomePage />} />
        <Route path="category/:categoryId" element={<CategoryPage />} />
        <Route path="tools/:toolId" element={<ToolPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
