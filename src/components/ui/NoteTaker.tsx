
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StickyNote, Plus, Save, X, Edit3, Trash2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  isRichText?: boolean;
}

interface StickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  timestamp: Date;
  color: string;
}

interface NoteTakerProps {
  className?: string;
}

export const NoteTaker: React.FC<NoteTakerProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showStickyDialog, setShowStickyDialog] = useState(false);
  const [newStickyContent, setNewStickyContent] = useState('');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('noteTaker-notes');
    const savedStickyNotes = localStorage.getItem('noteTaker-stickyNotes');
    
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
    localStorage.setItem('noteTaker-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('noteTaker-stickyNotes', JSON.stringify(stickyNotes));
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

  const saveNote = () => {
    if (!currentNote.trim()) return;
    
    const formattedNote = formatNotesToBullets(currentNote);
    const newNote: Note = {
      id: Date.now().toString(),
      content: formattedNote,
      timestamp: new Date(),
      isRichText: false
    };

    if (editingNoteId) {
      setNotes(prev => prev.map(note => 
        note.id === editingNoteId 
          ? { ...note, content: formattedNote }
          : note
      ));
      setEditingNoteId(null);
    } else {
      setNotes(prev => [newNote, ...prev]);
    }
    
    setCurrentNote('');
  };

  const editNote = (note: Note) => {
    setCurrentNote(note.content);
    setEditingNoteId(note.id);
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const createStickyNote = () => {
    if (!newStickyContent.trim()) return;

    const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newSticky: StickyNote = {
      id: Date.now().toString(),
      content: newStickyContent,
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 150) + 100,
      timestamp: new Date(),
      color: randomColor
    };

    setStickyNotes(prev => [...prev, newSticky]);
    setNewStickyContent('');
    setShowStickyDialog(false);
  };

  const deleteStickyNote = (noteId: string) => {
    setStickyNotes(prev => prev.filter(note => note.id !== noteId));
  };

  return (
    <>
      {/* Floating Note Taker Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-2xl",
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          "text-white border-0 transition-all duration-300 hover:scale-110",
          className
        )}
        size="icon"
      >
        <StickyNote className="w-6 h-6" />
      </Button>

      {/* Note Taker Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-blue-600" />
              Smart Notes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Note Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  {editingNoteId ? 'Edit Note' : 'Add New Note'}
                </h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowStickyDialog(true)}
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Sticky Note
                  </Button>
                  {editingNoteId && (
                    <Button 
                      onClick={() => {
                        setEditingNoteId(null);
                        setCurrentNote('');
                      }}
                      variant="outline" 
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                placeholder="Type your notes here... (will be auto-formatted as bullet points)"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="min-h-24"
                rows={4}
              />
              <Button 
                onClick={saveNote} 
                className="gap-2"
                disabled={!currentNote.trim()}
              >
                <Save className="w-4 h-4" />
                {editingNoteId ? 'Update Note' : 'Save Note'}
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                Your Notes
                <Badge variant="outline">{notes.length}</Badge>
              </h3>
              
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No notes yet. Start taking notes!</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <Card key={note.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="whitespace-pre-line text-sm text-gray-700 mb-2">
                              {note.content}
                            </div>
                            <div className="text-xs text-gray-500">
                              {note.timestamp.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => editNote(note)}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteNote(note.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Note Dialog */}
      <Dialog open={showStickyDialog} onOpenChange={setShowStickyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Sticky Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your sticky note content..."
              value={newStickyContent}
              onChange={(e) => setNewStickyContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={createStickyNote} disabled={!newStickyContent.trim()}>
                Create Sticky
              </Button>
              <Button variant="outline" onClick={() => setShowStickyDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Notes */}
      {stickyNotes.map((sticky) => (
        <StickyNoteComponent
          key={sticky.id}
          sticky={sticky}
          onDelete={() => deleteStickyNote(sticky.id)}
          onMove={(x, y) => {
            setStickyNotes(prev => prev.map(note => 
              note.id === sticky.id ? { ...note, x, y } : note
            ));
          }}
        />
      ))}
    </>
  );
};

interface StickyNoteComponentProps {
  sticky: StickyNote;
  onDelete: () => void;
  onMove: (x: number, y: number) => void;
}

const StickyNoteComponent: React.FC<StickyNoteComponentProps> = ({ 
  sticky, 
  onDelete, 
  onMove 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - sticky.x,
      y: e.clientY - sticky.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove(e.clientX - dragStart.x, e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      className={cn(
        "fixed w-48 min-h-32 p-3 rounded-lg shadow-lg cursor-move z-40 border-2 border-gray-300",
        sticky.color,
        isDragging ? "scale-105 shadow-2xl" : ""
      )}
      style={{
        left: sticky.x,
        top: sticky.y,
        transform: isDragging ? 'rotate(-2deg)' : 'rotate(1deg)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-600 font-medium">Note</div>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-gray-600 hover:text-red-600"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="text-sm text-gray-800 whitespace-pre-wrap">
        {sticky.content}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {sticky.timestamp.toLocaleDateString()}
      </div>
    </div>
  );
};
