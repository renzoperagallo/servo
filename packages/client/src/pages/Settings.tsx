import { useState, useEffect } from 'react';
import {
  userApi, User,
  getAppMode, setAppMode,
  getServerUrl, setServerUrl,
  testConnection,
  type AppMode
} from '../services/api';
import { useApi } from '../hooks/useApi';
import { Layout } from '../components/Layout';
import { FormField, Input, Button } from '../components/FormComponents';

export function Settings() {
  const { data: user, loading, refetch } = useApi<User>(
    () => userApi.getSettings(),
    []
  );

  const [cycleStartDay, setCycleStartDay] = useState('1');
  const [cycleEndDay, setCycleEndDay] = useState('31');
  const [mode, setModeState] = useState<AppMode>(getAppMode());
  const [serverUrl, setServerUrlState] = useState(getServerUrl());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      setCycleStartDay(user.cycleStartDay.toString());
      setCycleEndDay(user.cycleEndDay.toString());
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    await userApi.updateSettings({
      cycleStartDay: parseInt(cycleStartDay, 10),
      cycleEndDay: parseInt(cycleEndDay, 10)
    });

    setSaving(false);
    setSaved(true);
    refetch();

    setTimeout(() => setSaved(false), 2000);
  };

  const handleModeChange = (newMode: AppMode) => {
    setModeState(newMode);
    setAppMode(newMode);
    setConnectionStatus('idle');
  };

  const handleSaveServerUrl = () => {
    setServerUrl(serverUrl);
    setConnectionStatus('idle');
  };

  const handleTestConnection = async () => {
    setConnectionStatus('idle');
    const ok = await testConnection(serverUrl);
    setConnectionStatus(ok ? 'ok' : 'error');
  };

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <header className="pt-4">
          <h1 className="text-2xl font-bold text-slate-100">Configuracion</h1>
          <p className="text-sm text-slate-500 mt-1">Ajustes de la aplicacion</p>
        </header>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Modo de operacion</h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleModeChange('local')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === 'local'
                  ? 'border-servo-500 bg-servo-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <p className="font-semibold text-slate-200">Local</p>
              <p className="text-xs text-slate-500 mt-1">Datos en el celular. Sin internet.</p>
            </button>

            <button
              onClick={() => handleModeChange('remote')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === 'remote'
                  ? 'border-servo-500 bg-servo-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <p className="font-semibold text-slate-200">Servidor</p>
              <p className="text-xs text-slate-500 mt-1">Conecta a un servidor remoto.</p>
            </button>
          </div>

          {mode === 'remote' && (
            <div className="space-y-3 pt-2">
              <FormField label="URL del servidor">
                <Input
                  placeholder="http://192.168.1.100:3000"
                  value={serverUrl}
                  onChange={e => setServerUrlState(e.target.value)}
                />
              </FormField>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleTestConnection} className="flex-1">
                  Probar conexion
                </Button>
                <Button onClick={handleSaveServerUrl} className="flex-1">
                  Guardar URL
                </Button>
              </div>

              {connectionStatus === 'ok' && <p className="text-sm text-green-400">Conexion exitosa</p>}
              {connectionStatus === 'error' && <p className="text-sm text-red-400">No se pudo conectar</p>}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <span className="text-slate-500 animate-pulse">Cargando...</span>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-200 mb-2">Ciclo de Mes</h2>
              <p className="text-sm text-slate-500 mb-4">
                Define cuando comienza y termina tu mes de gastos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Dia de inicio">
                <Input
                  type="number"
                  min="1"
                  max="28"
                  value={cycleStartDay}
                  onChange={e => setCycleStartDay(e.target.value)}
                />
              </FormField>
              <FormField label="Dia de fin">
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={cycleEndDay}
                  onChange={e => setCycleEndDay(e.target.value)}
                />
              </FormField>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">
                <strong>Tu ciclo actual:</strong> Del dia {cycleStartDay} al dia {cycleEndDay} de cada mes
              </p>
            </div>

            <Button onClick={handleSave} loading={saving} className="w-full">
              {saved ? 'Guardado' : 'Guardar Configuracion'}
            </Button>
          </div>
        )}

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Acerca de Servo</h2>
          <div className="space-y-2 text-sm text-slate-500">
            <p>Version: 1.0.0</p>
            <p>App de control de gastos mensuales</p>
            <p className="text-slate-600">Modo: {mode === 'local' ? 'Local (SQLite)' : 'Servidor remoto'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
