// Página de progresso do aluno (exemplo)
export default function ProgressoPage() {
  // Aqui você buscaria o progresso do usuário no Firestore
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Meu Progresso</h1>
      <div className="bg-gray-100 p-4 rounded">Progresso em breve...</div>
    </div>
  );
}
