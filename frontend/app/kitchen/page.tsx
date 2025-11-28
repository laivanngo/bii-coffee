"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock } from "lucide-react";
import { toast } from "sonner";

interface OrderEvent {
  type: string;
  product: string;
  quantity: number;
  store: string;
  time: string;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Kết nối vào đường dây nóng WebSocket
    const ws = new WebSocket("ws:https://bii-coffee.onrender.com/ws/kitchen");

    ws.onopen = () => {
      setIsConnected(true);
      toast.success("🟢 Đã kết nối với máy chủ Bếp");
    };

    ws.onmessage = (event) => {
      // 2. Khi có tin nhắn đến
      const data = JSON.parse(event.data);
      
      if (data.type === "NEW_ORDER") {
        // Thêm đơn hàng mới vào đầu danh sách
        setOrders((prev) => [data, ...prev]);
        
        // Phát tiếng Ting (Nếu trình duyệt cho phép) hoặc hiện thông báo
        toast.message(`🔔 Đơn mới: ${data.product}`, {
            description: "Hãy làm ngay!",
            duration: 5000,
        });
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      toast.error("🔴 Mất kết nối máy chủ!");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold">Luckin Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <span className="text-sm text-slate-400">{isConnected ? "Online" : "Offline"}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-xl">Chưa có đơn hàng nào...</p>
          <p className="text-sm mt-2">Đang chờ khách đặt món</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 text-slate-100 animate-in fade-in slide-in-from-top-5 duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Badge className="bg-blue-600 text-lg px-3">#{orders.length - index}</Badge>
                <div className="flex items-center text-slate-400 text-xs gap-1">
                  <Clock className="h-3 w-3" /> {order.time}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {order.product}
                </div>
                <div className="text-xl font-semibold">
                  SL: x{order.quantity}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400">
                  Tại: {order.store}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}