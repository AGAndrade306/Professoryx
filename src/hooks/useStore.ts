import { create } from 'zustand'
import type { Materia, Aula, StatusAula } from '@/types'

interface AuthUser {
  id: string
  nome: string
  email: string
}

interface AppState {
  user: AuthUser | null
  materias: Materia[]
  aulas: Aula[]
  currentAulaStatus: StatusAula | null
  sidebarOpen: boolean

  setUser: (user: AuthUser | null) => void
  setMaterias: (materias: Materia[]) => void
  setAulas: (aulas: Aula[]) => void
  setCurrentAulaStatus: (status: StatusAula | null) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  materias: [],
  aulas: [],
  currentAulaStatus: null,
  sidebarOpen: true,

  setUser: (user) => set({ user }),
  setMaterias: (materias) => set({ materias }),
  setAulas: (aulas) => set({ aulas }),
  setCurrentAulaStatus: (status) => set({ currentAulaStatus: status }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
