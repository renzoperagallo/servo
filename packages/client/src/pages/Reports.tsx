import { reportsApi, Report } from '../services/api';
import { useApi, useMutation } from '../hooks/useApi';
import { Layout } from '../components/Layout';
import { Button } from '../components/FormComponents';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(amount);
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function Reports() {
  const { data: reports, loading, refetch } = useApi<Report[]>(
    () => reportsApi.getAll(),
    []
  );

  const { mutate: generateReport, loading: generating } = useMutation(
    () => reportsApi.generate()
  );

  const handleGenerate = async () => {
    await generateReport(undefined);
    refetch();
  };

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Reportes</h1>
            <p className="text-sm text-slate-500 mt-1">Historial de gastos mensuales</p>
          </div>
          <Button onClick={handleGenerate} loading={generating}>
            Generar
          </Button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="text-slate-500 animate-pulse">Cargando...</span>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map(report => {
              const data = JSON.parse(report.data);
              return (
                <div
                  key={report.id}
                  className="bg-slate-900 rounded-xl p-5 border border-slate-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-200">
                      {monthNames[report.month - 1]} {report.year}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Presupuesto</p>
                      <p className="text-sm font-mono text-slate-300">
                        {formatCurrency(data.totalBudget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Gastado</p>
                      <p className="text-sm font-mono text-red-400">
                        {formatCurrency(data.totalSpent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Disponible</p>
                      <p className={`text-sm font-mono ${
                        data.totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(data.totalRemaining)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {data.items.map((item: { id: string; name: string; spent: number; monthlyBudget: number }) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{item.name}</span>
                        <span className="font-mono text-slate-300">
                          {formatCurrency(item.spent)} / {formatCurrency(item.monthlyBudget)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
            <p className="text-slate-500">No hay reportes</p>
            <p className="text-sm text-slate-600 mt-1">
              Genera tu primer reporte mensual
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
