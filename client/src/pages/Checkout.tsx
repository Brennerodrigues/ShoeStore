import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: cartItems = [] } = trpc.cart.getItems.useQuery(undefined, { enabled: isAuthenticated });
  const { data: products = [] } = trpc.products.list.useQuery();
  const createOrderMutation = trpc.orders.createOrder.useMutation();
  const clearCartMutation = trpc.cart.clearCart.useMutation();

  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: "",
    shippingAddress: "",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center border-0 shadow-md">
          <p className="text-slate-600 mb-4">Você precisa estar logado para fazer checkout</p>
          <Button onClick={() => navigate("/")} className="bg-teal-700 hover:bg-teal-800">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? parseFloat(product.price) * item.quantity : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.shippingAddress) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const orderItems = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product?.price || "0",
        };
      });

      const result = await createOrderMutation.mutateAsync({
        ...formData,
        items: orderItems,
      });

      await clearCartMutation.mutateAsync();
      toast.success("Pedido criado com sucesso!");
      navigate(`/order-confirmation/${result.orderId}`);
    } catch (error) {
      toast.error("Erro ao criar pedido");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-0 shadow-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações de Entrega</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Seu nome"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="seu@email.com"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <Input
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Endereço de Entrega *</label>
                      <Input
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                        placeholder="Rua, número, complemento, cidade, estado, CEP"
                        className="border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Pagamento (Simulado)</h3>
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-700">
                      Este é um ambiente de teste. O pagamento será simulado e o pedido será criado automaticamente.
                    </p>
                  </Card>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 border-0 shadow-md sticky top-24">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  const itemTotal = parseFloat(product.price) * item.quantity;

                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{product.name} x{item.quantity}</span>
                      <span className="font-medium text-slate-900">R$ {itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frete:</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-lg">
                  <span>Total:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
