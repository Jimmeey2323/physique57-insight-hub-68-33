import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  StickyNote, 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  Tag,
  Search,
  FileText,
  Star,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  category: string;
}

interface AdvancedNotesModalProps {
  pageId: string;
  title?: string;
}

export const AdvancedNotesModal: React.FC<AdvancedNotesModalProps> = ({ 
  pageId, 
  title = "Personal Notes" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    priority: 'medium' as const,
    category: 'general'
  });

  const storageKey = `trainer-notes-${pageId}`;

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, [storageKey]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
      priority: newNote.priority,
      category: newNote.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({
      title: '',
      content: '',
      tags: [],
      priority: 'medium',
      category: 'general'
    });
    setIsOpen(false);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(notes.map(note => note.category)))];

  return (
    <div className="w-full">
      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-white/50 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">{title}</span>
                    <div className="text-sm text-indigo-600 font-normal">
                      {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </Badge>
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80 border-indigo-200 focus:border-indigo-400"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category 
                        ? "bg-indigo-600 hover:bg-indigo-700" 
                        : "border-indigo-200 hover:bg-indigo-50"
                      }
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-indigo-800">
                        <StickyNote className="w-5 h-5" />
                        Create New Note
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Note title..."
                        value={newNote.title}
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg font-semibold"
                      />
                      <Textarea
                        placeholder="Write your note here..."
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        rows={6}
                        className="resize-none"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                          <select
                            value={newNote.priority}
                            onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                          <Input
                            placeholder="Category..."
                            value={newNote.category}
                            onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                          <Input
                            placeholder="Add tags (comma separated)"
                            onChange={(e) => setNewNote(prev => ({ 
                              ...prev, 
                              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                            }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addNote} className="bg-indigo-600 hover:bg-indigo-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Note
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Notes Grid */}
              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note) => (
                    <Card key={note.id} className="bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-400">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {editingNote === note.id ? (
                              <Input
                                value={note.title}
                                onChange={(e) => updateNote(note.id, { title: e.target.value })}
                                onBlur={() => setEditingNote(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingNote(null)}
                                className="font-semibold text-sm"
                                autoFocus
                              />
                            ) : (
                              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                                {note.title}
                              </h3>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`text-xs ${getPriorityColor(note.priority)}`}>
                                <Star className="w-3 h-3 mr-1" />
                                {note.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {note.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingNote(note.id)}
                              className="p-1 h-6 w-6 hover:bg-indigo-100"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                              className="p-1 h-6 w-6 hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {editingNote === note.id ? (
                          <Textarea
                            value={note.content}
                            onChange={(e) => updateNote(note.id, { content: e.target.value })}
                            onBlur={() => setEditingNote(null)}
                            rows={3}
                            className="text-sm resize-none"
                          />
                        ) : (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                            {note.content}
                          </p>
                        )}
                        
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {note.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 border-t pt-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(note.updatedAt).toLocaleDateString()} at {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'No notes match your search criteria' 
                      : 'No notes yet. Create your first note to get started!'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};