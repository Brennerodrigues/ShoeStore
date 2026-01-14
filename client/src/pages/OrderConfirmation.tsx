import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useRoute } from "wouter";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function OrderConfirmation() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/order-confirmation/:orderId");

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Confirmação de Pedido</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-8 text-center border-0 shadow-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Pedido Confirmado!</h2>
          <p className="text-slate-600 mb-6">
            Seu pedido foi criado com sucesso. Você receberá um email de confirmação em breve.
          </p>

          <div className="bg-slate-50 p-6 rounded-lg mb-8 text-left">
            <p className="text-sm text-slate-600 mb-2">Número do Pedido:</p>
            <p className="text-2xl font-bold text-slate-900 mb-6"># {params?.orderId}</p>

            <div className="space-y-2 text-sm">
              <p className="text-slate-600">
                <span className="font-medium text-slate-900">Status:</span> Pendente de Pagamento
              </p>
              <p className="text-slate-600">
                <span className="font-medium text-slate-900">Entrega Estimada:</span> 7 dias úteis
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-teal-700 hover:bg-teal-800 text-white"
              onClick={() => navigate("/order-history")}
            >
              Ver Meus Pedidos
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/catalog")}
            >
              Continuar Comprando
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
