import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cycle, Class } from '../types';

interface CycleContextType {
  cycles: Cycle[];
  updateCycles: (newCycles: Cycle[]) => void;
  addClass: (cycleId: string, newClass: Class) => void;
  removeClass: (cycleId: string, classId: string) => void;
  updateClass: (cycleId: string, updatedClass: Class) => void;
  getCycle: (cycleId: string) => Cycle | undefined;
  getClass: (cycleId: string, classId: string) => Class | undefined;
}

const CycleContext = createContext<CycleContextType>({
  cycles: [],
  updateCycles: () => {},
  addClass: () => {},
  removeClass: () => {},
  updateClass: () => {},
  getCycle: () => undefined,
  getClass: () => undefined,
});

const loadStoredCycles = (): Cycle[] => {
  const stored = localStorage.getItem('edumanager_cycles');
  if (stored) {
    return JSON.parse(stored);
  }

  const defaultCycles: Cycle[] = [
    {
      id: '1',
      name: 'École Primaire',
      enabled: true,
      classes: [
        { id: '1', name: 'CP', enabled: true, dataStructure: [] },
        { id: '2', name: 'CE1', enabled: true, dataStructure: [] },
      ],
    },
    {
      id: '2',
      name: 'Collège',
      enabled: true,
      classes: [
        { id: '3', name: '6ème', enabled: true, dataStructure: [] },
        { id: '4', name: '5ème', enabled: true, dataStructure: [] },
      ],
    },
  ];

  localStorage.setItem('edumanager_cycles', JSON.stringify(defaultCycles));
  return defaultCycles;
};

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const [cycles, setCycles] = useState<Cycle[]>(loadStoredCycles);

  useEffect(() => {
    localStorage.setItem('edumanager_cycles', JSON.stringify(cycles));
  }, [cycles]);

  const updateCycles = (newCycles: Cycle[]) => {
    setCycles(newCycles);
  };

  const addClass = (cycleId: string, newClass: Class) => {
    setCycles(prevCycles => 
      prevCycles.map(cycle => 
        cycle.id === cycleId 
          ? { ...cycle, classes: [...cycle.classes, newClass] }
          : cycle
      )
    );
  };

  const removeClass = (cycleId: string, classId: string) => {
    setCycles(prevCycles => 
      prevCycles.map(cycle => 
        cycle.id === cycleId 
          ? { ...cycle, classes: cycle.classes.filter(cls => cls.id !== classId) }
          : cycle
      )
    );
  };

  const updateClass = (cycleId: string, updatedClass: Class) => {
    setCycles(prevCycles => 
      prevCycles.map(cycle => 
        cycle.id === cycleId 
          ? { 
              ...cycle, 
              classes: cycle.classes.map(cls => 
                cls.id === updatedClass.id ? updatedClass : cls
              )
            }
          : cycle
      )
    );
  };

  const getCycle = (cycleId: string) => {
    return cycles.find(cycle => cycle.id === cycleId);
  };

  const getClass = (cycleId: string, classId: string) => {
    const cycle = getCycle(cycleId);
    return cycle?.classes.find(cls => cls.id === classId);
  };

  return (
    <CycleContext.Provider value={{
      cycles,
      updateCycles,
      addClass,
      removeClass,
      updateClass,
      getCycle,
      getClass,
    }}>
      {children}
    </CycleContext.Provider>
  );
}

export const useCycles = () => useContext(CycleContext);