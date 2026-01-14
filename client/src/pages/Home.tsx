import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ShoppingBag, Truck, Shield, Star } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-teal-700" />
            <h1 className="text-2xl font-bold text-slate-900">ShoeStore</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/catalog")}>
              Catálogo
            </Button>
            {isAuthenticated && (
              <>
                <Button variant="ghost" onClick={() => navigate("/cart")}>
                  Carrinho
                </Button>
                <Button variant="ghost" onClick={() => navigate("/order-history")}>
                  Meus Pedidos
                </Button>
                {user?.role === "admin" && (
                  <Button variant="ghost" onClick={() => navigate("/admin")}>
                    Admin
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-teal-700 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Bem-vindo à ShoeStore</h2>
          <p className="text-xl text-teal-100 mb-8">Descubra a melhor coleção de sapatos de qualidade</p>
          <Button
            size="lg"
            className="bg-white text-teal-700 hover:bg-slate-100"
            onClick={() => navigate("/catalog")}
          >
            Explorar Catálogo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">Por que nos escolher?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition">
              <Truck className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-slate-900">Entrega Rápida</h4>
              <p className="text-slate-600">Entregamos seus pedidos em até 7 dias úteis</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition">
              <Shield className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-slate-900">Segurança Garantida</h4>
              <p className="text-slate-600">Suas compras são 100% seguras e protegidas</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition">
              <Star className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-slate-900">Qualidade Premium</h4>
              <p className="text-slate-600">Apenas sapatos de primeira qualidade</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-12 text-slate-900">Coleção em Destaque</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Tênis Urban Flex", price: "R$ 249,90" },
              { name: "Sapato Social Prime", price: "R$ 329,90" },
              { name: "Bota Adventure Pro", price: "R$ 389,90" },
              { name: "Mocassim Clássico Lux", price: "R$ 279,90" },
            ].map((product, idx) => (
              <Card key={idx} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate("/catalog")}>
                <div className="bg-gradient-to-br from-slate-300 to-slate-400 h-48 flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-slate-500 opacity-50" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">{product.name}</h4>
                  <p className="text-lg font-bold text-teal-700">{product.price}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-700 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
        <p className="text-lg text-teal-100 mb-8">Explore nossa coleção completa de sapatos</p>
        <Button
          size="lg"
          className="bg-white text-teal-700 hover:bg-slate-100"
          onClick={() => navigate("/catalog")}
        >
          Ver Todos os Produtos
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 ShoeStore. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
