import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Cart() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: cartItems = [], refetch } = trpc.cart.getItems.useQuery(undefined, { enabled: isAuthenticated });
  const { data: products = [] } = trpc.products.list.useQuery();
  const removeItemMutation = trpc.cart.removeItem.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center border-0 shadow-md">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Você precisa estar logado para ver seu carrinho</p>
          <Button onClick={() => navigate("/")} className="bg-teal-700 hover:bg-teal-800">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItemMutation.mutateAsync({ itemId });
      await refetch();
      toast.success("Produto removido do carrinho");
    } catch (error) {
      toast.error("Erro ao remover produto");
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? parseFloat(product.price) * item.quantity : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Meu Carrinho</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-md">
                <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Seu carrinho está vazio</p>
                <Button
                  onClick={() => navigate("/catalog")}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  Continuar Comprando
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  const itemTotal = parseFloat(product.price) * item.quantity;

                  return (
                    <Card key={item.id} className="p-4 border-0 shadow-md">
                      <div className="flex gap-4">
                        <div className="bg-slate-300 w-24 h-24 rounded flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-8 h-8 text-slate-500 opacity-50" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{product.name}</h4>
                          <p className="text-sm text-slate-600 mb-2">Quantidade: {item.quantity}</p>
                          <p className="text-lg font-bold text-teal-700">R$ {itemTotal.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div>
            <Card className="p-6 border-0 shadow-md sticky top-24">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumo do Carrinho</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frete:</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                  <span>Total:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-teal-700 hover:bg-teal-800 text-white mb-2"
                onClick={() => navigate("/checkout")}
                disabled={cartItems.length === 0}
              >
                Ir para Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/catalog")}
              >
                Continuar Comprando
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
