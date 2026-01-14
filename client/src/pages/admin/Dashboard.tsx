import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart3, Package, ShoppingCart, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: orders = [] } = trpc.orders.getAllOrders.useQuery();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center border-0 shadow-md">
          <p className="text-slate-600 mb-4">Acesso negado. Você não é administrador.</p>
          <Button onClick={() => navigate("/")} className="bg-teal-700 hover:bg-teal-800">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock < 10);
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Olá, {user?.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de Vendas</p>
                <p className="text-2xl font-bold text-slate-900">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-teal-700 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Produtos Cadastrados</p>
                <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-700 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-slate-900">{pendingOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-700 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Baixo Estoque</p>
                <p className="text-2xl font-bold text-slate-900">{lowStockProducts.length}</p>
              </div>
              <Package className="w-8 h-8 text-red-700 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-0 shadow-md cursor-pointer hover:shadow-lg transition" onClick={() => navigate("/admin/products")}>
            <Package className="w-8 h-8 text-teal-700 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Gerenciar Produtos</h3>
            <p className="text-sm text-slate-600">Adicionar, editar e remover produtos do catálogo</p>
          </Card>

          <Card className="p-6 border-0 shadow-md cursor-pointer hover:shadow-lg transition" onClick={() => navigate("/admin/orders")}>
            <ShoppingCart className="w-8 h-8 text-teal-700 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Gerenciar Pedidos</h3>
            <p className="text-sm text-slate-600">Visualizar e atualizar status dos pedidos</p>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="p-6 border-0 shadow-md bg-red-50 border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-red-900 mb-3">⚠️ Alerta de Baixo Estoque</h3>
            <p className="text-sm text-red-700 mb-4">
              {lowStockProducts.length} produto(s) com estoque abaixo de 10 unidades:
            </p>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <p key={product.id} className="text-sm text-red-700">
                  • {product.name} - {product.stock} unidades
                </p>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
