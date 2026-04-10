import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { StoryboardPage } from './pages/StoryboardPage';
import CharacterPage from './pages/CharacterPage';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/storyboard" element={<StoryboardPage />} />
        <Route path="/characters" element={<CharacterPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
