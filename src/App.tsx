import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home/HomePage';
import CurationPage from './pages/Curating/CurationPage';
import Detail from './pages/Curating/Detail';
import InsightPage1 from './pages/Insight/InsightPage1';
import MoreInfoPage from './pages/Insight/MoreInfo';

function App() {
  return (
    <Routes>
      {/* 홈 */}
      <Route path="/" element={<Home />} />

      {/* 큐레이션 */}
      <Route path="/curation" element={<CurationPage />} />

      {/* 장학금 상세 */}
      <Route path="/curation/:id" element={<Detail />} />

      {/* 인사이트 */}
      <Route path="/insight" element={<InsightPage1 />} />

      {/* 참고하면 좋아요 */}
      <Route path="/insight/reference" element={<MoreInfoPage />} />
    </Routes>
  );
}

export default App;
