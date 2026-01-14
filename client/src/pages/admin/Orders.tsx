import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminOrders() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: orders = [], refetch } = trpc.orders.getAllOrders.useQuery();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center border-0 shadow-md">
          <p className="text-slate-600 mb-4">Acesso negado.</p>
          <Button onClick={() => navigate("/")} className="bg-teal-700 hover:bg-teal-800">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "paid":
        return "Pago";
      case "shipped":
        return "Enviado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus as "pending" | "paid" | "shipped" | "completed" | "cancelled",
      });
      await refetch();
      toast.success("Status atualizado com sucesso");
      setSelectedOrderId(null);
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Pedidos</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-md">
            <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum pedido encontrado</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="p-6 border-0 shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">Pedido #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Cliente</p>
                        <p className="font-medium text-slate-900">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Email</p>
                        <p className="font-medium text-slate-900">{order.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Data</p>
                        <p className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Total</p>
                        <p className="font-medium text-teal-700">R$ {parseFloat(order.totalPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Change */}
                  <div className="flex flex-col gap-2">
                    {selectedOrderId === order.id ? (
                      <>
                        <select
                          className="px-3 py-2 border border-slate-300 rounded text-sm"
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value={order.status}>Manter como {getStatusLabel(order.status)}</option>
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="shipped">Enviado</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrderId(null)}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        Atualizar Status
                      </Button>
                    )}
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
