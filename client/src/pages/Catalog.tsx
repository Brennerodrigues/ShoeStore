import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Catalog() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.products.categories.useQuery();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
      const price = parseFloat(product.price);
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, priceRange]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Sapatos</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-0 shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Filtros</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
                <Input
                  placeholder="Nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-slate-300"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Categoria</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-3 py-2 rounded transition ${
                      !selectedCategory ? "bg-teal-100 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`block w-full text-left px-3 py-2 rounded transition ${
                        selectedCategory === cat.id ? "bg-teal-100 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Preço</label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-600">Mínimo: R$ {priceRange.min}</label>
                    <Input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Máximo: R$ {priceRange.max}</label>
                    <Input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-slate-600">{filteredProducts.length} produtos encontrados</p>
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-md">
                <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Nenhum produto encontrado com os filtros selecionados.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Card
                    key={product.id}
                    className="overflow-hidden border-0 shadow-md hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="bg-gradient-to-br from-slate-300 to-slate-400 h-48 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-slate-500 opacity-50" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-teal-700">R$ {parseFloat(product.price).toFixed(2)}</span>
                        <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                          {product.stock > 0 ? `${product.stock} em estoque` : "Fora de estoque"}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
