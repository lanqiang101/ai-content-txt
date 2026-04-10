import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { StoryboardPage } from './pages/StoryboardPage';
import CharacterPage from './pages/CharacterPage';
import WorksListPage from './pages/WorksListPage';
import WorkDetailPage from './pages/WorkDetailPage';
import ConfigPage from './pages/ConfigPage';
import CharacterListPage from './pages/CharacterListPage';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/works" element={<WorksListPage />} />
        <Route path="/works/:workId" element={<WorkDetailPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/characters" element={<CharacterListPage />} />
        <Route path="/storyboard" element={<StoryboardPage />} />
        <Route path="/characters/create" element={<CharacterPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
