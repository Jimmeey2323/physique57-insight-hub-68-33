import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Plus, Save, X, Edit3, Trash2, PlusCircle, Bold, Italic, List, Palette, Pin, Eye, EyeOff, Move, Maximize2, Minimize2, Type, Hash, Quote, Link, Calendar, User, Tag, MapPin, Anchor, MousePointer, Crosshair, Target, Layers, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  isRichText: boolean;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  category: string;
}
interface StickyNote {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp: Date;
  color: string;
  isCollapsed: boolean;
  isVisible: boolean;
  attachedTo?: string;
  page: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  isPinned: boolean;
  pinPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  zIndex: number;
}
interface AdvancedNoteTakerProps {
  className?: string;
  pageId?: string;
}
const COLORS = [{
  name: 'Sunshine',
  value: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
  border: 'border-yellow-400',
  text: 'text-yellow-900',
  shadow: 'shadow-yellow-200/50'
}, {
  name: 'Bubblegum',
  value: 'bg-gradient-to-br from-pink-200 to-pink-300',
  border: 'border-pink-400',
  text: 'text-pink-900',
  shadow: 'shadow-pink-200/50'
}, {
  name: 'Ocean',
  value: 'bg-gradient-to-br from-blue-200 to-blue-300',
  border: 'border-blue-400',
  text: 'text-blue-900',
  shadow: 'shadow-blue-200/50'
}, {
  name: 'Forest',
  value: 'bg-gradient-to-br from-green-200 to-green-300',
  border: 'border-green-400',
  text: 'text-green-900',
  shadow: 'shadow-green-200/50'
}, {
  name: 'Lavender',
  value: 'bg-gradient-to-br from-purple-200 to-purple-300',
  border: 'border-purple-400',
  text: 'text-purple-900',
  shadow: 'shadow-purple-200/50'
}, {
  name: 'Sunset',
  value: 'bg-gradient-to-br from-orange-200 to-orange-300',
  border: 'border-orange-400',
  text: 'text-orange-900',
  shadow: 'shadow-orange-200/50'
}, {
  name: 'Cherry',
  value: 'bg-gradient-to-br from-red-200 to-red-300',
  border: 'border-red-400',
  text: 'text-red-900',
  shadow: 'shadow-red-200/50'
}, {
  name: 'Mint',
  value: 'bg-gradient-to-br from-teal-200 to-teal-300',
  border: 'border-teal-400',
  text: 'text-teal-900',
  shadow: 'shadow-teal-200/50'
}, {
  name: 'Slate',
  value: 'bg-gradient-to-br from-slate-200 to-slate-300',
  border: 'border-slate-400',
  text: 'text-slate-900',
  shadow: 'shadow-slate-200/50'
}, {
  name: 'Emerald',
  value: 'bg-gradient-to-br from-emerald-200 to-emerald-300',
  border: 'border-emerald-400',
  text: 'text-emerald-900',
  shadow: 'shadow-emerald-200/50'
}];
const PRIORITIES = [{
  value: 'low',
  label: 'Low',
  color: 'bg-gray-100 text-gray-700'
}, {
  value: 'medium',
  label: 'Medium',
  color: 'bg-yellow-100 text-yellow-700'
}, {
  value: 'high',
  label: 'High',
  color: 'bg-red-100 text-red-700'
}];
export const AdvancedNoteTaker: React.FC<AdvancedNoteTakerProps> = ({
  className,
  pageId = window.location.pathname
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [currentPriority, setCurrentPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [currentCategory, setCurrentCategory] = useState('general');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showStickyDialog, setShowStickyDialog] = useState(false);
  const [newStickyContent, setNewStickyContent] = useState('');
  const [newStickyTitle, setNewStickyTitle] = useState('');
  const [newStickyColor, setNewStickyColor] = useState(COLORS[0].value);
  const [newStickyPriority, setNewStickyPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isPinMode, setIsPinMode] = useState(false);
  const [pinPosition, setPinPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('center');
  const [tagInput, setTagInput] = useState('');
  const [showAllStickies, setShowAllStickies] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('advancedNoteTaker-notes');
    const savedStickyNotes = localStorage.getItem('advancedNoteTaker-stickyNotes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }));
        setNotes(parsedNotes);
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
    if (savedStickyNotes) {
      try {
        const parsedStickyNotes = JSON.parse(savedStickyNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }));
        setStickyNotes(parsedStickyNotes);
      } catch (e) {
        console.error('Error loading sticky notes:', e);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('advancedNoteTaker-notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('advancedNoteTaker-stickyNotes', JSON.stringify(stickyNotes));
  }, [stickyNotes]);
  const formatNotesToBullets = (text: string): string => {
    if (!text.trim()) return '';
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return `• ${trimmed.substring(1).trim()}`;
      }
      return `• ${trimmed}`;
    }).join('\n');
  };
  const formatRichText = (text: string, format: 'bold' | 'italic' | 'bullets' | 'numbered' | 'header'): string => {
    switch (format) {
      case 'bold':
        return `**${text}**`;
      case 'italic':
        return `*${text}*`;
      case 'bullets':
        return formatNotesToBullets(text);
      case 'numbered':
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map((line, index) => `${index + 1}. ${line.trim()}`).join('\n');
      case 'header':
        return `# ${text}`;
      default:
        return text;
    }
  };
  const addTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setCurrentTags([...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };
  const saveNote = () => {
    if (!currentNote.trim()) return;
    const formattedNote = formatNotesToBullets(currentNote);
    const newNote: Note = {
      id: Date.now().toString(),
      title: currentTitle || 'Untitled Note',
      content: formattedNote,
      timestamp: new Date(),
      isRichText: true,
      tags: currentTags,
      priority: currentPriority,
      category: currentCategory
    };
    if (editingNoteId) {
      setNotes(prev => prev.map(note => note.id === editingNoteId ? {
        ...note,
        title: currentTitle,
        content: formattedNote,
        tags: currentTags,
        priority: currentPriority,
        category: currentCategory
      } : note));
      setEditingNoteId(null);
    } else {
      setNotes(prev => [newNote, ...prev]);
    }
    resetForm();
  };
  const resetForm = () => {
    setCurrentNote('');
    setCurrentTitle('');
    setCurrentTags([]);
    setCurrentPriority('medium');
    setCurrentCategory('general');
  };
  const editNote = (note: Note) => {
    setCurrentTitle(note.title);
    setCurrentNote(note.content);
    setCurrentTags(note.tags);
    setCurrentPriority(note.priority);
    setCurrentCategory(note.category);
    setEditingNoteId(note.id);
  };
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };
  const createStickyNote = () => {
    if (!newStickyContent.trim()) return;
    let x, y;
    if (isPinMode) {
      // Calculate position based on pin position
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const noteWidth = 280;
      const noteHeight = 200;
      switch (pinPosition) {
        case 'top-left':
          x = 20;
          y = 80;
          break;
        case 'top-right':
          x = viewportWidth - noteWidth - 20;
          y = 80;
          break;
        case 'bottom-left':
          x = 20;
          y = viewportHeight - noteHeight - 80;
          break;
        case 'bottom-right':
          x = viewportWidth - noteWidth - 20;
          y = viewportHeight - noteHeight - 80;
          break;
        case 'center':
        default:
          x = (viewportWidth - noteWidth) / 2;
          y = (viewportHeight - noteHeight) / 2;
          break;
      }
    } else {
      x = Math.random() * (window.innerWidth - 300) + 50;
      y = Math.random() * (window.innerHeight - 200) + 100;
    }
    const newSticky: StickyNote = {
      id: Date.now().toString(),
      title: newStickyTitle || 'Quick Note',
      content: newStickyContent,
      x,
      y,
      width: 280,
      height: 200,
      timestamp: new Date(),
      color: newStickyColor,
      isCollapsed: false,
      isVisible: true,
      page: pageId,
      tags: [],
      priority: newStickyPriority,
      isPinned: isPinMode,
      pinPosition: isPinMode ? pinPosition : undefined,
      opacity: 0.95,
      zIndex: 1000
    };
    setStickyNotes(prev => [...prev, newSticky]);
    setNewStickyContent('');
    setNewStickyTitle('');
    setNewStickyColor(COLORS[0].value);
    setNewStickyPriority('medium');
    setIsPinMode(false);
    setPinPosition('center');
    setShowStickyDialog(false);
  };
  const deleteStickyNote = (noteId: string) => {
    setStickyNotes(prev => prev.filter(note => note.id !== noteId));
  };
  const updateStickyNote = (noteId: string, updates: Partial<StickyNote>) => {
    setStickyNotes(prev => prev.map(note => note.id === noteId ? {
      ...note,
      ...updates
    } : note));
  };
  const toggleStickyCollapse = (noteId: string) => {
    updateStickyNote(noteId, {
      isCollapsed: !stickyNotes.find(n => n.id === noteId)?.isCollapsed
    });
  };
  const toggleStickyVisibility = (noteId: string) => {
    updateStickyNote(noteId, {
      isVisible: !stickyNotes.find(n => n.id === noteId)?.isVisible
    });
  };

  // Filter sticky notes for current page
  const pageStickies = stickyNotes.filter(sticky => sticky.page === pageId && sticky.isVisible);
  const filteredNotes = notes.filter(note => selectedCategory === 'all' || note.category === selectedCategory);
  const categories = ['all', 'general', 'sales', 'analytics', 'insights', 'todo', 'important'];
  return <>
      {/* Floating Note Taker Button */}
      

      {/* Sticky Notes Visibility Toggle */}
      

      {/* Advanced Note Taker Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Advanced Notes
                </span>
                <p className="text-sm text-gray-600 font-normal">Rich formatting • Sticky notes • Persistent storage</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Note Creation Panel */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    {editingNoteId ? 'Edit Note' : 'Create New Note'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Note Title</label>
                    <Input placeholder="Enter note title..." value={currentTitle} onChange={e => setCurrentTitle(e.target.value)} className="bg-white border-gray-200" />
                  </div>

                  {/* Category and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <Select value={currentCategory} onValueChange={setCurrentCategory}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(cat => cat !== 'all').map(category => <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <Select value={currentPriority} onValueChange={(value: any) => setCurrentPriority(value)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map(priority => <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                                {priority.label}
                              </div>
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tags</label>
                    <div className="flex gap-2">
                      <Input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTag()} className="bg-white border-gray-200" />
                      <Button onClick={addTag} size="sm" variant="outline">
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    {currentTags.length > 0 && <div className="flex flex-wrap gap-1">
                        {currentTags.map(tag => <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-red-100" onClick={() => removeTag(tag)}>
                            {tag} <X className="w-3 h-3 ml-1" />
                          </Badge>)}
                      </div>}
                  </div>

                  {/* Rich Text Formatting Toolbar */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Content</label>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                      <Button variant="ghost" size="sm" onClick={() => setCurrentNote(formatRichText(currentNote, 'bold'))} className="h-8 px-2">
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentNote(formatRichText(currentNote, 'italic'))} className="h-8 px-2">
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentNote(formatRichText(currentNote, 'bullets'))} className="h-8 px-2">
                        <List className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentNote(formatRichText(currentNote, 'numbered'))} className="h-8 px-2">
                        <Hash className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentNote(formatRichText(currentNote, 'header'))} className="h-8 px-2">
                        <Type className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <Textarea placeholder="Type your note here... Use the formatting buttons above for rich text." value={currentNote} onChange={e => setCurrentNote(e.target.value)} className="min-h-32 bg-white border-gray-200" rows={6} />

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button onClick={saveNote} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={!currentNote.trim()}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingNoteId ? 'Update Note' : 'Save Note'}
                    </Button>
                    <Button onClick={() => setShowStickyDialog(true)} variant="outline" className="gap-2">
                      <PlusCircle className="w-4 h-4" />
                      Sticky Note
                    </Button>
                    {editingNoteId && <Button onClick={() => {
                    setEditingNoteId(null);
                    resetForm();
                  }} variant="outline">
                        <X className="w-4 h-4" />
                      </Button>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes List Panel */}
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-blue-600" />
                    Your Notes
                    <Badge variant="outline">{filteredNotes.length}</Badge>
                  </h3>
                </div>
                
                {filteredNotes.length === 0 ? <p className="text-gray-500 text-center py-8">No notes yet. Start taking notes!</p> : <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredNotes.map(note => <Card key={note.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{note.title}</h4>
                                <Badge className={PRIORITIES.find(p => p.value === note.priority)?.color}>
                                  {note.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {note.category}
                                </Badge>
                              </div>
                              <div className="whitespace-pre-line text-sm text-gray-700 mb-2">
                                {note.content}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {note.timestamp.toLocaleString()}
                                {note.tags.length > 0 && <div className="flex gap-1 ml-2">
                                    {note.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>)}
                                  </div>}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button onClick={() => editNote(note)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => deleteNote(note.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Note Creation Dialog */}
      <Dialog open={showStickyDialog} onOpenChange={setShowStickyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-blue-600" />
              Create Sticky Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input placeholder="Sticky note title..." value={newStickyTitle} onChange={e => setNewStickyTitle(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                <Button variant="ghost" size="sm" onClick={() => setNewStickyContent(formatRichText(newStickyContent, 'header'))} className="h-8 px-2">
                  <Type className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setNewStickyContent(formatRichText(newStickyContent, 'bold'))} className="h-8 px-2">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setNewStickyContent(formatRichText(newStickyContent, 'italic'))} className="h-8 px-2">
                  <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setNewStickyContent(formatRichText(newStickyContent, 'bullets'))} className="h-8 px-2">
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setNewStickyContent(formatRichText(newStickyContent, 'numbered'))} className="h-8 px-2">
                  <Hash className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Textarea placeholder="Enter your sticky note content..." value={newStickyContent} onChange={e => setNewStickyContent(e.target.value)} rows={4} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map(color => <button key={color.name} className={cn("w-10 h-10 rounded-xl border-2 transition-all duration-200 shadow-lg", color.value, color.border, color.shadow, newStickyColor === color.value ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105')} onClick={() => setNewStickyColor(color.value)}>
                      <div className="w-full h-full rounded-lg opacity-80"></div>
                    </button>)}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select value={newStickyPriority} onValueChange={(value: any) => setNewStickyPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(priority => <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                          {priority.label}
                        </div>
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pin Mode Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Pin to Position</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pinMode" checked={isPinMode} onChange={e => setIsPinMode(e.target.checked)} className="rounded border-gray-300" />
                <label htmlFor="pinMode" className="text-sm text-gray-600">
                  Pin to specific screen position
                </label>
              </div>
              
              {isPinMode && <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Pin Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant={pinPosition === 'top-left' ? 'default' : 'outline'} size="sm" onClick={() => setPinPosition('top-left')} className="h-12 flex flex-col items-center gap-1">
                      <Anchor className="w-4 h-4" />
                      <span className="text-xs">Top Left</span>
                    </Button>
                    <Button variant={pinPosition === 'center' ? 'default' : 'outline'} size="sm" onClick={() => setPinPosition('center')} className="h-12 flex flex-col items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xs">Center</span>
                    </Button>
                    <Button variant={pinPosition === 'top-right' ? 'default' : 'outline'} size="sm" onClick={() => setPinPosition('top-right')} className="h-12 flex flex-col items-center gap-1">
                      <Anchor className="w-4 h-4" />
                      <span className="text-xs">Top Right</span>
                    </Button>
                    <Button variant={pinPosition === 'bottom-left' ? 'default' : 'outline'} size="sm" onClick={() => setPinPosition('bottom-left')} className="h-12 flex flex-col items-center gap-1">
                      <Anchor className="w-4 h-4" />
                      <span className="text-xs">Bottom Left</span>
                    </Button>
                    <div></div>
                    <Button variant={pinPosition === 'bottom-right' ? 'default' : 'outline'} size="sm" onClick={() => setPinPosition('bottom-right')} className="h-12 flex flex-col items-center gap-1">
                      <Anchor className="w-4 h-4" />
                      <span className="text-xs">Bottom Right</span>
                    </Button>
                  </div>
                </div>}
            </div>

            <div className="flex gap-2">
              <Button onClick={createStickyNote} disabled={!newStickyContent.trim()} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                {isPinMode ? <Anchor className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
                {isPinMode ? 'Pin Note' : 'Create Sticky'}
              </Button>
              <Button variant="outline" onClick={() => setShowStickyDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Notes */}
      {showAllStickies && pageStickies.map(sticky => <StickyNoteComponent key={sticky.id} sticky={sticky} onDelete={() => deleteStickyNote(sticky.id)} onUpdate={updates => updateStickyNote(sticky.id, updates)} onToggleCollapse={() => toggleStickyCollapse(sticky.id)} />)}
    </>;
};
interface StickyNoteComponentProps {
  sticky: StickyNote;
  onDelete: () => void;
  onUpdate: (updates: Partial<StickyNote>) => void;
  onToggleCollapse: () => void;
}
const StickyNoteComponent: React.FC<StickyNoteComponentProps> = ({
  sticky,
  onDelete,
  onUpdate,
  onToggleCollapse
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(sticky.content);
  const [editTitle, setEditTitle] = useState(sticky.title);
  const [isHovered, setIsHovered] = useState(false);
  const colorConfig = COLORS.find(c => c.value === sticky.color) || COLORS[0];
  const priorityConfig = PRIORITIES.find(p => p.value === sticky.priority) || PRIORITIES[1];
  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    e.preventDefault();
    if (type === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - sticky.x,
        y: e.clientY - sticky.y
      });
    } else {
      setIsResizing(true);
      setDragStart({
        x: e.clientX - sticky.width,
        y: e.clientY - sticky.height
      });
    }
  };
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onUpdate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      onUpdate({
        width: Math.max(200, e.clientX - dragStart.x),
        height: Math.max(150, e.clientY - dragStart.y)
      });
    }
  }, [isDragging, isResizing, dragStart, onUpdate]);
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  const saveEdit = () => {
    onUpdate({
      content: editContent,
      title: editTitle
    });
    setIsEditing(false);
  };
  const cancelEdit = () => {
    setEditContent(sticky.content);
    setEditTitle(sticky.title);
    setIsEditing(false);
  };
  if (sticky.isCollapsed) {
    return <div className={cn("fixed w-14 h-14 rounded-full shadow-xl cursor-pointer border-2 transition-all duration-300 hover:scale-125 group", colorConfig.value, colorConfig.border, colorConfig.shadow, "flex items-center justify-center backdrop-blur-sm", sticky.isPinned && "ring-2 ring-blue-400 ring-opacity-50")} style={{
      left: sticky.x,
      top: sticky.y,
      opacity: sticky.opacity,
      zIndex: sticky.zIndex
    }} onClick={onToggleCollapse} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <StickyNote className="w-6 h-6 text-gray-700 group-hover:rotate-12 transition-transform" />
        {sticky.priority === 'high' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg">
            <Zap className="w-2 h-2 text-white m-1" />
          </div>}
        {sticky.isPinned && <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded-full shadow-lg">
            <Pin className="w-2 h-2 text-white m-1" />
          </div>}
        
        {/* Hover tooltip */}
        {isHovered && <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
            {sticky.title}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>}
      </div>;
  }
  return <div className={cn("fixed rounded-2xl shadow-2xl cursor-move border-2 transition-all duration-300 backdrop-blur-sm", colorConfig.value, colorConfig.border, colorConfig.shadow, isDragging ? "scale-105 shadow-3xl rotate-2" : "hover:shadow-xl", isResizing && "ring-2 ring-blue-400", sticky.isPinned && "ring-2 ring-blue-400 ring-opacity-50")} style={{
    left: sticky.x,
    top: sticky.y,
    width: sticky.width,
    height: sticky.height,
    opacity: sticky.opacity,
    zIndex: sticky.zIndex
  }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-black/10 rounded-t-2xl cursor-move backdrop-blur-sm" onMouseDown={e => !sticky.isPinned && handleMouseDown(e, 'drag')}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {sticky.isPinned ? <Pin className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <Move className="w-4 h-4 text-gray-600 flex-shrink-0" />}
          <span className="font-semibold text-sm truncate">{sticky.title}</span>
          <Badge className={`${priorityConfig.color} text-xs`}>
            {sticky.priority}
          </Badge>
          {sticky.isPinned && <Badge className="bg-blue-100 text-blue-700 text-xs">
              Pinned
            </Badge>}
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50" onClick={() => onUpdate({
          isPinned: !sticky.isPinned
        })}>
            {sticky.isPinned ? <Anchor className="w-3 h-3 text-blue-600" /> : <Pin className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50" onClick={() => onUpdate({
          opacity: sticky.opacity === 0.95 ? 0.7 : 0.95
        })}>
            <Eye className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50" onClick={onToggleCollapse}>
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100" onClick={onDelete}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-hidden">
        {isEditing ? <div className="space-y-2 h-full flex flex-col">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-sm bg-white/90 border-gray-200" placeholder="Note title..." />
            <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 text-sm bg-white/90 resize-none border-gray-200" placeholder="Note content..." />
            <div className="flex gap-1">
              <Button onClick={saveEdit} size="sm" className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700">
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button onClick={cancelEdit} variant="outline" size="sm" className="h-8 text-xs">
                Cancel
              </Button>
            </div>
          </div> : <div className="h-full overflow-auto">
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
              {sticky.content}
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-black/10 flex items-center justify-between">
              <span>{sticky.timestamp.toLocaleDateString()}</span>
              <span>{sticky.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>}
      </div>

      {/* Resize Handle */}
      {!sticky.isPinned && <div className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity group" onMouseDown={e => handleMouseDown(e, 'resize')}>
          <div className="w-full h-full flex items-end justify-end p-1">
            <div className="w-3 h-3 border-r-2 border-b-2 border-gray-600 rounded-br group-hover:border-blue-500"></div>
          </div>
        </div>}
      
      {/* Pin indicator */}
      {sticky.isPinned && <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>}
    </div>;
};