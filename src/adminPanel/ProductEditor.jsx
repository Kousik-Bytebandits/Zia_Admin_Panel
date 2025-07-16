import { useState, useEffect } from 'react';
import { FaSync, FaRupeeSign, FaPercent } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import endpoint_prefix from '../config/ApiConfig';
import "react-datepicker/dist/react-datepicker.css";
import { forwardRef } from "react";
import NotificationPopup from '../components/NotificatioPopup';
import Loader from '../components/Loader';

export default function ProductEditor() {
  const inputClasses = "w-full p-2 border border-gray-300 rounded-md  text-sm";
  const [loading, setLoading] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);
  const CalendarInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full">
    <input
      type="text"
      onClick={onClick}
      ref={ref}
      value={value}
      placeholder={placeholder}
      readOnly
      className="w-full p-2 pr-10 border border-gray-300 rounded-md bg-white text-sm"
    />
    <FiCalendar
      className="absolute right-3 top-[10px] text-gray-500 cursor-pointer"
      onClick={onClick}
    />
  </div>
));

 const [popup, setPopup] = useState({
    show: false,
    type: "success",
    message: "",
  });
 
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
  };

 const [formData, setFormData] = useState({
  productName: "",
  sku: "",
 category: "Shampoo",
  mfgDate: "",
  price: "",
  discount: "",
  expDate: "",
  warehouse: "",
  batchCode: "",
  isActive: "Active",
  isFeatured:"No",
  description: "",
  features: "",
  howToUse: "",
  ingredients: "",
  specifications: {
    Units: "ml",
    Item_LWH: "0x0x0",
    Package_LWH: "0x0x0",
    Item_Weight: "0",
    Package_Weight: "0",
  },
});


  const [images, setImages] = useState({
    Primary_Image: null,
    Secondary_Image: null,
    Normal_Image1: null,
    Normal_Image2: null,
  });

  const [imagePreviews, setImagePreviews] = useState({});

  const textAreaFields = [
    { label: "Description", name: "description" },
    { label: "Features", name: "features" },
    { label: "How to use", name: "howToUse" },
    { label: "Ingredients", name: "ingredients" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value,
      },
    }));
  };

 const handleImageChange = (e, key) => {
  const file = e.target.files[0];
  if (file) {
    setImages((prev) => ({ ...prev, [key]: file }));
    setImagePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  } else {
    console.warn(`No file selected for ${key}`);
  }
};

  const triggerImageUpload = (key) => {
    document.getElementById(key).click();
  };

const fetchProductDetails = async (productId = 1) => {
  try {
    const res = await fetch(`${endpoint_prefix}03_Admin_Panel/api/products/${productId}`);
    const json = await res.json();
     const product = json.data.product;
    

    // Check structure
    const data = json.data || json;

    if (!data.product) {
      console.error("No 'product' key found in response");
      return;
    }

   
    const batch = data.batch || {};
    const images = data.images || [];

    const formatDate = (isoDate) => {
      if (!isoDate) return "";
      const d = new Date(isoDate);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    setFormData({
      productName: product.product_name || product.name || "",
      sku: product.sku || "",
      category: product.category || "Shampoo",
      mfgDate: formatDate(batch.manufacturing_Date || batch.manufacture_date),
      expDate: formatDate(batch.Expiry_Date || batch.expiry_date),
      price: product.Price || product.price || "",
      discount: product.Discount || product.discount || "",
      warehouse: batch.warehouse_location || "",
      batchCode: product.Stock || batch.quantity || "",
      isActive: Number(product.is_active) === 1 ? "Active" : "Inactive",
      isFeatured: Number(product.is_featured) === 1 ? "Yes" : "No",
      description: product.Description || "",
      features: product.Features || "",
      howToUse: product.How_To_Use || "",
      ingredients: product.Ingredients || "",
      specifications: {
        Units: product.Units || "ml",
        Item_LWH: JSON.parse(product.Product_Spesifications || "{}")["item-LWH"] || "0x0x0",
        Package_LWH: JSON.parse(product.Product_Spesifications || "{}")["Package-LWH"] || "0x0x0",
        Item_Weight: JSON.parse(product.Product_Spesifications || "{}")["item-Weight"] || "0",
        Package_Weight: JSON.parse(product.Product_Spesifications || "{}")["Package-Weight"] || "0",
      },
    });

    const previewData = {};
    const imageMap = {
      primary: "Primary_Image",
      secondary: "Secondary_Image",
      normal1: "Normal_Image1",
      normal2: "Normal_Image2",
    };
    images.forEach((img) => {
      const key = imageMap[img.image_type];
      if (key) {
        previewData[key] = img.image_url;
      }
    });

    setImagePreviews(previewData);
  } catch (err) {
    console.error("Failed to fetch product details:", err);
  }
};





useEffect(() => {
  if (createdProductId) {
    fetchProductDetails(createdProductId);
  }
}, [createdProductId]);






const handleSubmit = async () => {
  setLoading(true);

  const requiredFields = [
    { field: formData.productName, name: "Product Name" },
    { field: formData.sku, name: "SKU" },
    { field: formData.category, name: "Category" },
    { field: formData.price, name: "Price" },
  ];

  const toNumber = (val, fallback = 0) => {
    const num = parseFloat(val?.toString().trim());
    return isNaN(num) ? fallback : num;
  };

const convertToDDMMYY = (input) => {
  if (!input) return "";
  const [day, month, year] = input.split("-");
  return `${day}-${month}-${year.slice(2)}`;
};





  for (const { field, name } of requiredFields) {
    if (!field?.trim()) {
      showPopup("error", `${name} is required`);
      setLoading(false); 
      return;
    }
  }

  const payload = new FormData();
  payload.append("product_name", formData.productName.trim());
  payload.append("sku", formData.sku.trim());
  payload.append("category", formData.category.trim());
  payload.append("Price", toNumber(formData.price));
  payload.append("Discount", toNumber(formData.discount));
  payload.append("Stock", toNumber(formData.batchCode));
  payload.append("Units", formData.specifications.Units || "ml");
  payload.append("Is_Active", formData.isActive === "Active" ? "true" : "false");
  payload.append("is_featured", formData.isFeatured === "Yes" ? "true" : "false");
  payload.append("Description", formData.description.trim());
  payload.append("Features", formData.features.trim());
  payload.append("How_To_Use", formData.howToUse.trim());
  payload.append("Ingredients", formData.ingredients.trim());
 payload.append("manufacturing_Date", convertToDDMMYY(formData.mfgDate));
payload.append("Expiry_Date", convertToDDMMYY(formData.expDate));

  const safeSpecs = {
    "item-LWH": formData.specifications.Item_LWH,
    "item-Weight": toNumber(formData.specifications.Item_Weight),
    "Package-LWH": formData.specifications.Package_LWH,
    "Package-Weight": toNumber(formData.specifications.Package_Weight),
  };
  payload.append("Product_Spesifications", JSON.stringify(safeSpecs));

  if (images.Primary_Image) payload.append("primary_image", images.Primary_Image);
  if (images.Secondary_Image) payload.append("secondary_image", images.Secondary_Image);
  if (images.Normal_Image1) payload.append("normal1_image", images.Normal_Image1);
  if (images.Normal_Image2) payload.append("normal2_image", images.Normal_Image2);

  const isUpdate = createdProductId !== null;
  const endpoint = isUpdate
    ? `${endpoint_prefix}03_Admin_Panel/api/products/${createdProductId}`
    : `${endpoint_prefix}03_Admin_Panel/api/products/`;

  try {
    const res = await fetch(endpoint, {
      method: isUpdate ? "PUT" : "POST",
      body: payload,
    });

    if (res.ok) {
      const msg = isUpdate ? "Product updated successfully!" : "Product created successfully!";
      showPopup("success", msg);

      if (!isUpdate) {
        const result = await res.json();
        const id = result.product_id || null;
        setCreatedProductId(id);
      }
    } else {
      const errorText = await res.text();
      showPopup("error", errorText);
    }
  } catch (error) {
    showPopup("error", error.message);
    console.log(error);
  } finally {
    setLoading(false); // ✅ Hide loader always
  }
};





  const [currentDate, setCurrentDate] = useState("");

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
    const interval = setInterval(updateDate, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#f1f2e9] overflow-y-auto scrollbar-none">
      {/* Header */}
      <section className="mb-4 text-white">
        <div className="rounded w-full min-h-[80px] bg-[#102B01] flex flex-col md:flex-row md:items-center px-6 py-4 gap-4">
          <h2 className="text-[24px] md:text-[30px] font-bold uppercase flex-1">Upload Products</h2>
          <div className="flex items-center gap-3">
            <p className="hidden md:inline text-[18px]">Data Refresh</p>
            <FaSync className="hidden md:inline cursor-pointer text-lg" title="Sync" />
            <span className="text-sm md:text-base text-[#102B01] border border-[#375683] px-3 py-1 rounded-md bg-white font-bold">
              {currentDate}
            </span>
          </div>
        </div>
      </section>

   {loading && <Loader />}

      {/* Product Images */}
      <h1 className="xxxl:text-[20px] laptop:text-[20px] hd:text-[20px] sm:text-[24px] font-bold text-[#102B01] ">Product Settings</h1>
      <h2 className="text-[16px] font-bold text-[#102B01]  -mb-4 ">Product Images</h2>
      <div className="flex flex-col lg:flex-row  xxxl:gap-6 laptop:gap-3   items-center justify-between">
       
        
        <div className="flex  gap-4 xxxl:mt-6 laptop:mt-4 hd:mt-4">
          {[
            { key: "Primary_Image", label: "Click to upload" },
            { key: "Secondary_Image", label: "Click to upload" },
          ].map(({ key, label }) => (
            <div
              key={key}
              onClick={() => triggerImageUpload(key)}
              className="cursor-pointer flex-col xxxl:w-[270px] xxxl:h-[270px] laptop:w-[220px] laptop:h-[250px] border-2 border-dashed border-[#102B01] rounded-md bg-white flex items-center justify-center "
            >
              {imagePreviews[key] ? (
                <img src={imagePreviews[key]} alt={label} className="w-full h-full object-cover rounded-md" />
              ) : (
                <>
                  <img src="/icons/img-icon.png" alt="Upload" className="w-10 h-10 opacity-70" />
                  <p className="text-[15px] text-center px-1">{label}</p>
                </>
              )}
              <input
                id={key}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, key)}
              />
            </div>
          ))}
        </div>

        
        <div className="flex flex-col xxxl:gap-4 hd:gap-3 laptop:gap-6  xxxl:mt-6 laptop:mt-4 hd:mt-4">
          {[
            { key: "Normal_Image1", label: "Click to upload" },
            { key: "Normal_Image2", label: "Click to upload" },
          ].map(({ key, label }) => (
            <div
              key={key}
              onClick={() => triggerImageUpload(key)}
              className="cursor-pointer xxxl:w-[125px] xxxl:h-[125px] laptop:w-[100px] laptop:h-[110px] hd:w-[120px] hd:h-[120px] border-2 border-dashed border-[#102B01] rounded-md bg-white flex items-center justify-center flex-col"
            >
              {imagePreviews[key] ? (
                <img src={imagePreviews[key]} alt={label} className="w-full h-full object-cover rounded-md" />
              ) : (
                <>
                  <img src="/icons/img-icon.png" alt="Upload" className="w-6 h-6 opacity-70" />
                  <p className="text-xs text-center px-1">{label}</p>
                </>
              )}
              <input
                id={key}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, key)}
              />
            </div>
          ))}
        </div>
    
        
      {/* Input Fields */}
     <div className="flex-1 xxxl:space-y-4 laptop:space-y-1">
 
  <div className="grid grid-cols-1 sm:grid-cols-2 xxxl:gap-4 laptop:gap-2 hd:gap-4">
    <div>
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Product Name</label>
      <input
        name="productName"
        value={formData.productName}
        onChange={handleChange}
        type="text"
        className={inputClasses}
        placeholder="Enter product name"
      />
    </div>
    <div>
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">SKU</label>
      <input
        name="sku"
        value={formData.sku}
        onChange={handleChange}
        type="text"
        className={inputClasses}
        placeholder="Enter SKU"
      />
    </div>
  </div>

 
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
   

    <div className="relative">
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Category</label>
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className={`${inputClasses} pr-10 appearance-none`}
      >
                  <option value="shampoo">Shampoo</option>
                  <option value="handwash">Handwash</option>
                  <option value="soap">Soap</option>
                  <option value="hairoil">Hair Oil</option>
                  <option value="body_oil">Body Massage Oil</option>
                  <option value="lip_balm">Lip Balm</option>
                  <option value="face_pack">Face Pack</option>
                  <option value="serum">Serum</option>
                  <option value="face_wash">Face Wash</option>
                  <option value="foot_gel">Foot Gel</option>
                  <option value="foot_cream">Foot Cream</option>
      </select>
      <IoIosArrowDown className="absolute xxxl:right-3 xxxl:top-[40px] laptop:top-[35px] laptop:right-3 text-gray-500" />
    </div>

   <div className='relative '>
  <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Manufacturing Date</label>
  <input
  name="mfgDate"
  value={formData.mfgDate}
  onChange={handleChange}
  type="date"
  className={`${inputClasses} pr-2`}
  placeholder="DD-MM-YYYY"
/>


</div>
  <div className='relative '>
  <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Expiry Date</label>
  <input
  name="expDate"
  value={formData.expDate}
  onChange={handleChange}
  type="date"
  className={`${inputClasses} pr-2`}
  placeholder="DD-MM-YYYY"
/>




</div>

    <div className="relative">
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Price</label>
      <input
        name="price"
        value={formData.price}
        onChange={handleChange}
        type="number"
        className={`${inputClasses} pr-10`}
      />
      <FaRupeeSign className="absolute right-3 top-[35px] text-gray-500" />
    </div>

    <div className="relative">
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Discount </label>
      <input
        name="discount"
        value={formData.discount}
        onChange={handleChange}
        type="number"
        className={`${inputClasses} pr-10`}
      />
      <FaPercent className="absolute right-3 top-[35px] text-gray-500" />
    </div>

  <div>
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Stock</label>
      <input
        name="batchCode"
        value={formData.batchCode}
        onChange={handleChange}
        type="number"
        className={inputClasses}
      />
    </div>


    <div>
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Warehouse Location</label>
      <input
        name="warehouse"
        value="Zia-guindy"
      
        type="text"
        className={`${inputClasses} bg-[#D9D9D9]`}
        readOnly
      />
    </div>

   
 <div className="relative">
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Is Featured</label>
      <select
        name="isFeatured"
        value={formData.isFeatured}
        onChange={handleChange}
        className={`${inputClasses} pr-10 appearance-none`}
      >
        <option>Yes</option>
        <option>No</option>
      </select>
      <IoIosArrowDown className="absolute right-3 top-[40px] text-gray-500" />
    </div>
    <div className="relative">
      <label className="xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] font-bold text-[#102B01] mb-1 block">Is Active</label>
      <select
        name="isActive"
        value={formData.isActive}
        onChange={handleChange}
        className={`${inputClasses} pr-10 appearance-none`}
      >
        <option>Active</option>
        <option>Inactive</option>
      </select>
      <IoIosArrowDown className="absolute right-3 top-[40px] text-gray-500" />
    </div>
  </div>
</div>

      </div>

      
      <div className="flex flex-col xl:flex-row gap-6 mt-8">
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
         {textAreaFields.map(({ label, name }) => (
  <div key={name}>
    <h3 className="text-[16px] font-bold text-[#102B01] mb-2">{label}</h3>
    <div className="bg-white rounded-lg shadow-sm px-4 pt-3 pb-2 h-[200px]">
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleTextAreaChange}
        className="w-full h-full resize-none outline-none bg-transparent text-sm text-[#1F3612]"
      />
    </div>
  </div>
))}

        </div>

       
        <div className="w-full xl:max-w-[42%] mt-8">
          <div className="bg-white rounded-xl shadow-md border border-[#E4E4E4] p-4">
            <h2 className="text-[16px] font-bold text-[#102B01] mb-4">Product Specifications</h2>
            <div className="overflow-auto rounded-2xl border border-[#E4E4E4]">
              <table className="w-full xxxl:text-[14px] laptop:text-[12px] hd:text-[14px] text-left border border-[#E4E4E4]">
                <thead className="text-[#534D59]">
                  <tr className="bg-[#F9FAFC]">
                    <th className="px-4 py-3 border border-[#E4E4E4]">Name</th>
                    <th className="px-4 py-3 border border-[#E4E4E4]">Value</th>
                  </tr>
                </thead>
              <tbody className="text-[#1B2128]">
  {Object.entries(formData.specifications).map(([key, value], index) => (
    <tr key={index}>
      <td className="px-4 py-3 border border-[#E4E4E4] whitespace-nowrap">{key}</td>
      <td className="px-4 py-3 border border-[#E4E4E4] whitespace-nowrap">
        <input
          type="text"
          name={key}
          value={value}
          onChange={handleSpecificationChange}
          className="w-full px-2 py-1 rounded-md text-sm bg-white"
        />
      </td>
    </tr>
  ))}
</tbody>


      
  

              </table>
            </div>
          </div>

          {/* Publish Button */}
          <div className="mt-4">
           <button
  onClick={handleSubmit}
  className="bg-[#EEB420] text-[#102B01] w-full text-[20px] font-bold py-4 px-6 rounded-full shadow-md hover:bg-[#d6a81f] transition-all"
>
  {createdProductId ? "Update Product" : "Publish Product"}
</button>

          </div>
        </div>
      </div>
       <NotificationPopup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ ...popup, show: false })}
      />
    </div>
  );
}
