import { create } from 'zustand'
import type { Materia, Aula, StatusAula } from '@/types'

interface AppState {
  materias: Materia[]
  aulas: Aula[]
  currentAulaStatus: StatusAula | null
  sidebarOpen: boolean

  setMaterias: (materias: Materia[]) => void
  setAulas: (aulas: Aula[]) => void
  setCurrentAulaStatus: (status: StatusAula | null) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  materias: [],
  aulas: [],
  currentAulaStatus: null,
  sidebarOpen: true,

  setMaterias: (materias) => set({ materias }),
  setAulas: (aulas) => set({ aulas }),
  setCurrentAulaStatus: (status) => set({ currentAulaStatus: status }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
