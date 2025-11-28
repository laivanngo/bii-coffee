"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Coffee, MapPin } from "lucide-react";
import { toast } from "sonner"; // <--- Dùng thư viện mới

// Định nghĩa kiểu dữ liệu
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category_id: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lấy Menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("https://bii-coffee.onrender.com");
        setProducts(response.data);
      } catch (error) {
        console.error("Lỗi:", error);
        toast.error("Không kết nối được với Server Backend!");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // 2. Xử lý Đặt hàng
  const handleOrder = async (productId: number, productName: string) => {
    // Hiển thị thông báo "Đang xử lý..."
    const toastId = toast.loading("Đang gửi đơn hàng...");

    try {
      // Giả định mua ở Store ID = 1
      await axios.post("https://bii-coffee.onrender.com", {
        store_id: 1,
        product_id: productId,
        quantity: 1
      });

      // Nếu thành công -> Đổi thông báo thành màu xanh
      toast.success(`Thành công! Món ${productName} đang được pha.`, {
        id: toastId, // Đóng cái thông báo "Đang xử lý" lại
      });

    } catch (error: any) {
      // Nếu thất bại -> Đổi thông báo thành màu đỏ
      const message = error.response?.data?.detail || "Có lỗi xảy ra";
      toast.error(`Thất bại: ${message}`, {
        id: toastId,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#0022AB] text-white p-4 sticky top-0 z-10 shadow-lg"> {/* Màu xanh Luckin */}
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="font-bold text-lg tracking-wide">Luckin Clone</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-blue-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <MapPin className="h-3 w-3" />
            <span>Quận 1, TP.HCM</span>
          </div>
        </div>
      </div>

      {/* Banner Khuyến mãi giả */}
      <div className="max-w-md mx-auto mt-4 px-4">
        <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
          <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</div>
          <p className="text-sm text-orange-800 font-medium">Mua 1 tặng 1 cho đơn đầu tiên!</p>
        </div>
      </div>

      {/* Danh sách món */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h2 className="font-bold text-xl text-slate-800 mb-2">Menu Đề Xuất</h2>
        
        {loading ? (
          <div className="flex justify-center py-10 text-slate-400">Đang tải dữ liệu từ bếp...</div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-row overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white p-2 rounded-xl">
                {/* Ảnh món */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                  <img 
                    src={product.image_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG"} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thông tin */}
                <div className="flex flex-col justify-between pl-3 py-1 w-full">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1 line-clamp-2">
                      Hương vị đậm đà, nguyên liệu cao cấp từ Arabica.
                    </CardDescription>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-[#0022AB] text-lg">
                      {product.price.toLocaleString()}đ
                    </span>
                    <Button 
                      size="icon"
                      className="bg-[#0022AB] hover:bg-blue-800 rounded-full h-8 w-8 shadow-blue-200 shadow-lg"
                      onClick={() => handleOrder(product.id, product.name)}
                    >
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}