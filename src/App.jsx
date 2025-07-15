
import { Routes, Route } from 'react-router-dom';
import Sidebar from './adminPanel/Sidebar'; 
import ProductEditor from './adminPanel/ProductEditor'; 
import ProductGrid from './adminPanel/ProductGrid';
import ProductUpdate from './adminPanel/ProductUpdate'
export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <Routes>
        <Route path="/" element={<ProductEditor />} />
        <Route path="/grid" element={<ProductGrid />} />
        <Route path="/grid/:productId" element={<ProductUpdate />} />

      </Routes>
    </div>
  );
}
