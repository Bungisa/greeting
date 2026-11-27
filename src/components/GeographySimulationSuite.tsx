import React, { useEffect, useState } from 'react';
import {
  GEOGRAPHY_SIM_MODES,
  type GeographySimMode,
} from './geographySimulationsData';
import {
  EarthTimeSeasonsLab,
  MapReadingSimulationLab,
  TectonicsVulcanicityLab,
  WeatherClimateLab,
} from './GeographyPhysicalLabs';
import {
  RiversCoastsLab,
  SoilRocksLab,
  StatisticalGraphsLab,
  SurveyingSimulationLab,
} from './GeographyPracticalLabs';

export interface GeographySimulationSuiteProps {
  darkMode?: boolean;
  activeClass?: string;
  initialMode?: GeographySimMode;
}

export const GeographySimulationSuite: React.FC<GeographySimulationSuiteProps> = ({
  darkMode = false,
  initialMode = 'map_reading',
}) => {
  const [activeMode, setActiveMode] = useState<GeographySimMode>(initialMode);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  const currentMeta =
    GEOGRAPHY_SIM_MODES.find((m) => m.id === activeMode) || GEOGRAPHY_SIM_MODES[0];

  return (
    <div className="space-y-4">
      {/* 8-Lab Geography Switcher Bar */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          darkMode
            ? 'bg-[#101624] border-white/[0.08]'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {currentMeta.formLevel} · {currentMeta.nectaFocus}
            </div>
            <h2 className="text-base sm:text-lg font-black mt-0.5">
              {currentMeta.fullTitle}
            </h2>
          </div>
        </div>

        {/* 8 Interactive Lab Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {GEOGRAPHY_SIM_MODES.map((m) => {
            const isSelected = m.id === activeMode;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : darkMode
                      ? 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-teal-500/50'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400'
                }`}
              >
                {m.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Geography Laboratory Stage */}
      {activeMode === 'map_reading' && <MapReadingSimulationLab darkMode={darkMode} />}
      {activeMode === 'earth_time' && <EarthTimeSeasonsLab darkMode={darkMode} />}
      {activeMode === 'weather_climate' && <WeatherClimateLab darkMode={darkMode} />}
      {activeMode === 'tectonics_vulcanicity' && (
        <TectonicsVulcanicityLab darkMode={darkMode} />
      )}
      {activeMode === 'rivers_coasts' && <RiversCoastsLab darkMode={darkMode} />}
      {activeMode === 'statistical_graphs' && <StatisticalGraphsLab darkMode={darkMode} />}
      {activeMode === 'surveying_lab' && <SurveyingSimulationLab darkMode={darkMode} />}
      {activeMode === 'soil_rocks' && <SoilRocksLab darkMode={darkMode} />}
    </div>
  );
};

export default GeographySimulationSuite;
