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

export interface FireproofConfig {
  cloudSync?: boolean;
  encryptionEnabled?: boolean;
}

export const useFireproofProjects = (config?: FireproofConfig) => {
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

  const getProject = async (id: string): Promise<Project | null> => {
    try {
      const doc = await database.get(id)
      return doc as Project
    } catch {
      return null
    }
  }

  const getAllProjects = async (): Promise<Project[]> => {
    return projects.docs || []
  }

  const exportDatabase = async (): Promise<string> => {
    const allDocs = projects.docs || []
    return JSON.stringify(allDocs, null, 2)
  }

  const importToDatabase = async (jsonData: string): Promise<number> => {
    const docs = JSON.parse(jsonData)
    let imported = 0
    for (const doc of docs) {
      try {
        await database.put({
          ...doc,
          _id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          updated_at: new Date().toISOString()
        })
        imported++
      } catch (err) {
        console.error('Failed to import doc:', err)
      }
    }
    return imported
  }

  const clearDatabase = async (): Promise<void> => {
    const allDocs = projects.docs || []
    for (const doc of allDocs) {
      if (doc._id) {
        await database.del(doc._id)
      }
    }
  }

  return {
    projects: projects.docs || [],
    saveProject,
    updateProject,
    deleteProject,
    getProject,
    getAllProjects,
    exportDatabase,
    importToDatabase,
    clearDatabase,
    database
  }
}
