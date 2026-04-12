import Messages from './pages/Messages';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Feed from './pages/Feed';
import Network from './pages/Network';
import { AuthProvider } from './context/AuthContext'; // <--- IMPORT ITO

export default function App() {
  return (
    <BrowserRouter>
      {/* <--- BALUTIN NG AUTH PROVIDER ---> */}
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/network" element={<Network />} />
            <Route path="/messages" element={<Messages />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}