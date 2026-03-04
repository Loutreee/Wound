import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Combat from './pages/Combat';
import CombatId from './pages/CombatId';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/combat" element={<Combat />} />
        <Route path="/combat/:combatId" element={<CombatId />} />
      </Routes>
    </Layout>
  );
}

export default App;
