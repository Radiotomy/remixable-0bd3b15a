import { useLiveQuery, useFireproof } from '@fireproof/react'

export interface Project {
  _id?: string
  title: string
  description?: string
  category: string
  template_id?: string
  code: Record<string, any>
  preview_data?: Record<string, any>
  is_published: boolean
  created_at: string
  updated_at: string
  user_id?: string
}

export const useFireproofProjects = () => {
  const { database } = useFireproof('remixable-projects')
  
  const projects = useLiveQuery((doc: any) => {
    if (doc.type === 'project') {
      return doc.created_at
    }
  })

  const saveProject = async (project: Omit<Project, '_id'>) => {
    const projectDoc = {
      ...project,
      type: 'project',
      _id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return await database.put(projectDoc)
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const existing = await database.get(id)
    const updatedDoc = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    return await database.put(updatedDoc)
  }

  const deleteProject = async (id: string) => {
    return await database.del(id)
  }

  return {
    projects: projects.docs || [],
    saveProject,
    updateProject,
    deleteProject,
    database
  }
}