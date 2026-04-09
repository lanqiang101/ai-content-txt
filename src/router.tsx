import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import StoryboardPage from './pages/StoryboardPage';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/storyboard" element={<StoryboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
