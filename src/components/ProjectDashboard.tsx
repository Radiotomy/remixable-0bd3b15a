import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  ExternalLink,
  Code2, 
  Database, 
  Rocket,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Eye,
  Copy,
  Trash2,
  Edit3,
  Share2
} from 'lucide-react';
import { useProjectManager, EnhancedProject } from '@/hooks/useProjectManager';
import { useFireproofProjects } from '@/hooks/useFireproof';
import { cn } from '@/lib/utils';
import { templateCategories } from '@/data/templates';

interface ProjectDashboardProps {
  onCreateNew: () => void;
  onOpenProject: (project: EnhancedProject) => void;
}

export const ProjectDashboard = ({ onCreateNew, onOpenProject }: ProjectDashboardProps) => {
  const { 
    projects, 
    loading, 
    error, 
    publishProject, 
    deleteProject 
  } = useProjectManager();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'category'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favorite-projects');
    if (saved) {
      setFavoriteProjects(JSON.parse(saved));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (projectId: string) => {
    const newFavorites = favoriteProjects.includes(projectId)
      ? favoriteProjects.filter(id => id !== projectId)
      : [...favoriteProjects, projectId];
    
    setFavoriteProjects(newFavorites);
    localStorage.setItem('favorite-projects', JSON.stringify(newFavorites));
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'recent':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  // Get project stats
  const stats = {
    total: projects.length,
    published: projects.filter(p => p.is_published).length,
    drafts: projects.filter(p => !p.is_published).length,
    categories: [...new Set(projects.map(p => p.category).filter(Boolean))].length
  };

  const ProjectCard = ({ project }: { project: EnhancedProject }) => {
    const isFavorite = favoriteProjects.includes(project._id || '');
    const category = templateCategories.find(cat => cat.id === project.category);

    return (
      <Card className={cn(
        "group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
        "glass border-border/50",
        viewMode === 'list' && "hover:scale-100"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{project.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description || 'No description'}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(project._id || '');
                }}
                className="h-8 w-8 p-0"
              >
                <Star className={cn(
                  "w-4 h-4",
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Open project menu
                }}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.icon} {category.name}
              </Badge>
            )}
            {project.is_published && (
              <Badge variant="outline" className="text-xs">
                <Rocket className="w-3 h-3 mr-1" />
                Published
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent 
          className="pt-0 cursor-pointer"
          onClick={() => onOpenProject(project)}
        >
          {/* Mock Preview */}
          <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="h-2 bg-white/20 rounded mb-1" />
              <div className="h-2 bg-white/10 rounded w-2/3" />
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  <span>{Object.keys(project.code?.components || {}).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>{project.backend?.schema ? '1' : '0'}</span>
                </div>
              </div>
              <span>{new Date(project.updated_at).toLocaleDateString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Projects</h1>
              <p className="text-muted-foreground">
                Manage and deploy your AI-generated applications
              </p>
            </div>
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.published}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.drafts}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.categories}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass border-border/50 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {templateCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border rounded-lg">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid/List */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription>
              Error loading projects: {error}
            </AlertDescription>
          </Alert>
        )}

        {filteredProjects.length === 0 ? (
          <Card className="glass border-border/50 text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                  <Code2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">
                  {searchTerm || selectedCategory !== 'all' ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first AI-powered application to get started'
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <Button onClick={onCreateNew} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};