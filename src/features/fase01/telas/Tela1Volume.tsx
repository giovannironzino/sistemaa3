// Tela1Volume.tsx
// Tela 1 — Volume de Procura
// 6 campos numéricos (contador −/+ e digitação direta) para os 6 clusters.

import React, { useState } from 'react';
import { VolumePorCluster, ClusterId } from '../fase01.types';
import { CLUSTERS } from '../data/bancoDePromessas';
import { Minus, Plus, ArrowRight } from 'lucide-react';

interface Tela1VolumeProps {
  initialVolumes: VolumePorCluster[];
  onAvancar: (volumes: VolumePorCluster[]) => void;
}

function buildInitialVolumes(initial: VolumePorCluster[]): VolumePorCluster[] {
  return CLUSTERS.map((c) => {
    const found = initial.find((v) => v.clusterId === c.id);
    return { clusterId: c.id as ClusterId, quantidadePessoas: found?.quantidadePessoas ?? 0 };
  });
}

export default function Tela1Volume({ initialVolumes, onAvancar }: Tela1VolumeProps) {
  const [volumes, setVolumes] = useState<VolumePorCluster[]>(() =>
    buildInitialVolumes(initialVolumes)
  );

  function updateVolume(clusterId: ClusterId, value: number) {
    const safe = Math.max(0, isNaN(value) ? 0 : Math.floor(value));
    setVolumes((prev) =>
      prev.map((v) => (v.clusterId === clusterId ? { ...v, quantidadePessoas: safe } : v))
    );
  }

  function increment(clusterId: ClusterId) {
    setVolumes((prev) =>
      prev.map((v) =>
        v.clusterId === clusterId
          ? { ...v, quantidadePessoas: v.quantidadePessoas + 1 }
          : v
      )
    );
  }

  function decrement(clusterId: ClusterId) {
    setVolumes((prev) =>
      prev.map((v) =>
        v.clusterId === clusterId
          ? { ...v, quantidadePessoas: Math.max(0, v.quantidadePessoas - 1) }
          : v
      )
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela1_volume">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Eixo 01 · Fase 01 · Tela 1 de 6
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Nos últimos 90 dias, quantas pessoas te procuraram por cada um destes motivos?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Pense em mensagens no WhatsApp, no Direct do Instagram, ou até em gente que te parou na
          rua. Conte todo mundo que te perguntou sobre isso, mesmo que não tenha fechado com você.
        </p>
      </div>

      {/* Cluster Volume Fields */}
      <div className="space-y-3">
        {volumes.map((vol, idx) => {
          const cluster = CLUSTERS[idx];
          return (
            <div
              key={vol.clusterId}
              id={`cluster_volume_${vol.clusterId}`}
              className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-indigo-500/30 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-200 flex-1 leading-snug">
                {cluster.label}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id={`btn_decrement_${vol.clusterId}`}
                  onClick={() => decrement(vol.clusterId)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/40 transition-all cursor-pointer"
                  aria-label={`Diminuir ${cluster.label}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id={`input_volume_${vol.clusterId}`}
                  type="number"
                  min={0}
                  value={vol.quantidadePessoas}
                  onChange={(e) =>
                    updateVolume(vol.clusterId, parseInt(e.target.value, 10))
                  }
                  className="w-14 text-center bg-white/5 border border-white/10 rounded-lg text-white font-bold text-base py-1.5 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  id={`btn_increment_${vol.clusterId}`}
                  onClick={() => increment(vol.clusterId)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/40 transition-all cursor-pointer"
                  aria-label={`Aumentar ${cluster.label}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela1_avancar"
          onClick={() => onAvancar(volumes)}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
