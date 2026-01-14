import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation, useRoute } from "wouter";
import { ShoppingBag, ArrowLeft, Plus, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/product/:id");
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);

  const productId = params?.id ? parseInt(params.id) : null;
  const { data: product } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );
  const { data: sizes = [] } = trpc.products.sizes.useQuery();
  const { data: colors = [] } = trpc.products.colors.useQuery();
  const addToCartMutation = trpc.cart.addItem.useMutation();

  if (!match || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para adicionar ao carrinho");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
        variationId: selectedSize,
      });
      toast.success("Produto adicionado ao carrinho!");
      setQuantity(1);
    } catch (error) {
      toast.error("Erro ao adicionar ao carrinho");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/catalog")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Detalhes do Produto</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-gradient-to-br from-slate-300 to-slate-400 h-96 flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-slate-500 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Product Info */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h2>
            <p className="text-slate-600 mb-6">{product.description}</p>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-teal-700">R$ {parseFloat(product.price).toFixed(2)}</p>
              <p className={`text-sm font-medium mt-2 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} em estoque` : "Fora de estoque"}
              </p>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Tamanho</label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map(size => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`py-2 rounded border transition ${
                      selectedSize === size.id
                        ? "bg-teal-700 text-white border-teal-700"
                        : "border-slate-300 text-slate-700 hover:border-teal-700"
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Cor</label>
              <div className="flex gap-3">
                {colors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === color.id ? "border-slate-900" : "border-slate-300"
                    }`}
                    style={{ backgroundColor: color.hexCode || "#ccc" }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Quantidade</label>
              <div className="flex items-center gap-2 w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-slate-300"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addToCartMutation.isPending}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {addToCartMutation.isPending ? "Adicionando..." : "Adicionar ao Carrinho"}
            </Button>

            {/* Continue Shopping */}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/catalog")}
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
