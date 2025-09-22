import { useLiveQuery, useFireproof } from '@fireproof/react'
import { Database } from '@fireproof/core'

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
  
  const projects = useLiveQuery('projects', {
    map: function(doc: any) {
      if (doc.type === 'project') {
        emit(doc.created_at, doc)
      }
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
    const doc = await database.get(id)
    return await database.del(doc._id, doc._rev)
  }

  return {
    projects: projects.docs || [],
    saveProject,
    updateProject,
    deleteProject,
    database
  }
}