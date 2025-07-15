import { useState, useEffect, useCallback } from "react";
import { FaSync, FaChevronDown } from "react-icons/fa";
import endpoint_prefix from "../config/ApiConfig";

import { useNavigate } from "react-router-dom";
export default function ProductGrid() {
  const [category, setCategory] = useState("shampoo");
  const [products, setProducts] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [page, setPage] = useState(1);
 
  const limit = 12;
  const totalPages = 10;
  const navigate = useNavigate();
  const handleChange = (id) => {
  navigate(`/grid/${id}`);
};

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentDate(`${formattedDate} ${formattedTime}`);
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(
        `${endpoint_prefix}03_Admin_Panel/api/products/category/${category}?page=${page}&limit=${limit}`
      );
      const json = await res.json();
      setProducts(json.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, [category, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const renderPagination = () => {
    const paginationButtons = [];

    if (page > 1) {
      paginationButtons.push(
        <button key="prev" className="font-bold" onClick={() => setPage(page - 1)}>
          Prev
        </button>
      );
    }

    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      paginationButtons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-[40px] h-[40px] rounded ${
            page === i ? "bg-[#2B452C] text-white" : "border border-[#ccc] text-[#BCBCBC]"
          }`}
        >
          {i}
        </button>
      );
    }

    if (totalPages > 4) {
      paginationButtons.push(<span key="dots" className="px-2">...</span>);
      paginationButtons.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className={`w-[40px] h-[40px] rounded ${
            page === totalPages ? "bg-[#2B452C] text-white" : "border border-[#ccc] text-[#BCBCBC]"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    if (page < totalPages) {
      paginationButtons.push(
        <button key="next" className="font-bold" onClick={() => setPage(page + 1)}>
          Next
        </button>
      );
    }

    return (
      <div className="flex justify-center md:justify-end items-center gap-3 mt-8 text-[16px] font-medium text-[#2B452C]">
        {paginationButtons}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#F7F9F3] font-inter overflow-y-auto scrollbar-none px-4 py-6 min-h-screen">
      <section className="flex flex-col justify-center lg:justify-between items-center lg:items-start text-white mb-4">
        <div className="rounded w-full py-4 bg-[#102B01] md:flex items-center px-6">
          <h2 className="text-[26px] md:text-[30px] font-bold uppercase flex-1 text-left">
            Product Grid
          </h2>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <p className="hidden md:inline text-[18px]">Data Refresh</p>
            <FaSync className="hidden md:inline cursor-pointer text-lg" title="Sync" onClick={fetchProducts} />
            <span className="text-sm md:text-base text-[#102B01] border border-[#375683] px-3 py-1 rounded-md bg-white font-bold">
              {currentDate}
            </span>
          </div>
        </div>
      </section>

      <div className="">
        <div className="border border-[#CFCFCF] w-full shadow-lg bg-white rounded-xl p-4 xxxl:p-6 laptop:p-4 hd:p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <label className="font-semibold text-[18px] xxxl:text-[20px] hd:text-[18px] laptop:text-[16px] block mb-2">Category</label>
              <div className="relative w-full xxxl:w-[300px] hd:w-[250px] laptop:w-[200px] ">
                <select
                  className="border border-[#D9D9D9] text-[#504F4F] rounded-md xxxl:py-3 hd:py-3 laptop:py-2 px-4 pr-8 w-full text-[15px] focus:outline-none appearance-none"
                  value={category}
                  onChange={(e) => {
                    setPage(1);
                    setCategory(e.target.value);
                  }}
                >
                  <option value="handwash">Handwash</option>
                  <option value="soap">Soap</option>
                  <option value="hairoil">Hair Oil</option>
                  <option value="body_massage_oil">Body Massage Oil</option>
                  <option value="shampoo">Shampoo</option>
                  <option value="lip_balm">Lip Balm</option>
                  <option value="face_pack">Face Pack</option>
                  <option value="serum">Serum</option>
                  <option value="face_wash">Face Wash</option>
                  <option value="foot_gel">Foot Gel</option>
                  <option value="foot_cream">Foot Cream</option>
                </select>
                <FaChevronDown className="absolute xxxl:top-4 laptop:top-3 hd:top-4 right-3 text-[#B7B7B7]" />
              </div>
            </div>
            <div className="text-[18px] xxxl:text-[22px] hd:text-[18px] laptop:text-[16px] font-semibold text-right w-full md:w-auto">
              View Products : {products.length}/{limit}
            </div>
          </div>

          <div className={`${products.length === 0 ? 'min-h-[300px]' : ''} grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xxxl:grid-cols-6 gap-4 mt-6`}>
            {products.length > 0 ? (
              products.map((product, index) => (
                console.log("Product Item:", product),
                <div
                onClick={() => handleChange(product.product_id)}

                  key={index}
                  className="bg-white rounded-xl shadow-md border hover:shadow-lg transition p-3 flex flex-col"
                >
                  <div
                    
                    className="cursor-pointer border border-[#E3E3E3] aspect-[4/3] flex items-center justify-center rounded-md mb-4"
                  >
                    <img
                      src={product.banner_image || "/images/h_shampoo.png "}
                      alt={product.name}
                      className="xxxl:h-[140px] laptop:h-[105px] hd:h-[125px] object-contain"
                    />
                  </div>
                  <h2 className="font-semibold xxxl:text-[15px] laptop:text-[14px] hd:text-[15px] leading-snug">{product.product_name}</h2>
                  <p className="text-[14px] text-[#555] mt-1">
                    Stock Available: <strong>{product.stock_available}</strong>
                  </p>
                  <p className="text-[14px] mt-1">
                    Price: <strong>₹{product.price}</strong>
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-[#777] text-lg py-16">
                No products found for this category.
              </div>
            )}
          </div>

         
          

          {renderPagination()}
        </div>
      </div>
    </div>
  );
}
