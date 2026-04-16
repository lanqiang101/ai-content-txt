import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { StoryboardPage } from './pages/StoryboardPage';
import StoryboardManagementPage from './pages/StoryboardManagementPage';
import CharacterPage from './pages/CharacterPage';
import WorksListPage from './pages/WorksListPage';
import WorkDetailPage from './pages/WorkDetailPage';
import ConfigPage from './pages/ConfigPage';
import ModelManagementPage from './pages/ModelManagementPage';
import CharacterListPage from './pages/CharacterListPage';
import { MemoryManagerPage } from './pages/MemoryManagerPage';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/works" element={<WorksListPage />} />
        <Route path="/works/:workId" element={<WorkDetailPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/models" element={<ModelManagementPage />} />
        <Route path="/characters" element={<CharacterListPage />} />
        <Route path="/storyboard" element={<StoryboardPage />} />
        <Route path="/storyboards" element={<StoryboardManagementPage />} />
        <Route path="/characters/create" element={<CharacterPage />} />
        <Route path="/characters/new" element={<CharacterPage />} />
        <Route path="/memory" element={<MemoryManagerPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;