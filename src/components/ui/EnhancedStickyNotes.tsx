
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  StickyNote, 
  X, 
  GripVertical, 
  Minimize2, 
  Maximize2, 
  Bold, 
  Italic, 
  List, 
  ChevronRight,
  Plus,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyNote {
  id: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  isCollapsed: boolean;
  isRichText: boolean;
  attachedTo?: string;
}

interface EnhancedStickyNotesProps {
  className?: string;
}

const COLORS = [
  { name: 'Yellow', value: 'bg-yellow-200', border: 'border-yellow-300' },
  { name: 'Pink', value: 'bg-pink-200', border: 'border-pink-300' },
  { name: 'Blue', value: 'bg-blue-200', border: 'border-blue-300' },
  { name: 'Green', value: 'bg-green-200', border: 'border-green-300' },
  { name: 'Purple', value: 'bg-purple-200', border: 'border-purple-300' },
  { name: 'Orange', value: 'bg-orange-200', border: 'border-orange-300' },
];

export const EnhancedStickyNotes: React.FC<EnhancedStickyNotesProps> = ({ className }) => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'move' | 'resize';
    noteId: string | null;
    startPos: { x: number; y: number };
    startSize?: { width: number; height: number };
  }>({
    isDragging: false,
    dragType: 'move',
    noteId: null,
    startPos: { x: 0, y: 0 }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Create new note
  const createNote = (x: number = 100, y: number = 100) => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: '',
      position: { x, y },
      size: { width: 250, height: 200 },
      color: COLORS[0].value,
      isCollapsed: false,
      isRichText: false
    };
    setNotes(prev => [...prev, newNote]);
    setActiveNote(newNote.id);
    setIsCreating(false);
  };

  // Delete note
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (activeNote === noteId) {
      setActiveNote(null);
    }
  };

  // Toggle note collapse
  const toggleCollapse = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isCollapsed: !note.isCollapsed } : note
    ));
  };

  // Update note content
  const updateNoteContent = (noteId: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, content } : note
    ));
  };

  // Update note color
  const updateNoteColor = (noteId: string, color: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, color } : note
    ));
  };

  // Convert text to bullet points
  const convertToBulletPoints = (text: string): string => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
        return `• ${trimmed}`;
      }
      return trimmed;
    }).join('\n');
  };

  // Handle text formatting
  const formatText = (noteId: string, format: 'bold' | 'italic' | 'bullets') => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    let newContent = note.content;
    
    if (format === 'bullets') {
      newContent = convertToBulletPoints(note.content);
    }
    
    updateNoteContent(noteId, newContent);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, noteId: string, type: 'move' | 'resize') => {
    e.preventDefault();
    setDragState({
      isDragging: true,
      dragType: type,
      noteId,
      startPos: { x: e.clientX, y: e.clientY },
      startSize: type === 'resize' ? notes.find(n => n.id === noteId)?.size : undefined
    });
    setActiveNote(noteId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.noteId) return;

    const deltaX = e.clientX - dragState.startPos.x;
    const deltaY = e.clientY - dragState.startPos.y;

    setNotes(prev => prev.map(note => {
      if (note.id !== dragState.noteId) return note;

      if (dragState.dragType === 'move') {
        return {
          ...note,
          position: {
            x: note.position.x + deltaX,
            y: note.position.y + deltaY
          }
        };
      } else if (dragState.dragType === 'resize' && dragState.startSize) {
        return {
          ...note,
          size: {
            width: Math.max(200, dragState.startSize.width + deltaX),
            height: Math.max(150, dragState.startSize.height + deltaY)
          }
        };
      }

      return note;
    }));

    setDragState(prev => ({ ...prev, startPos: { x: e.clientX, y: e.clientY } }));
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      dragType: 'move',
      noteId: null,
      startPos: { x: 0, y: 0 }
    });
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging]);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full", className)}>
      {/* Add Note Button */}
      <Button
        onClick={() => createNote()}
        className="fixed top-4 right-4 z-50 bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Note
      </Button>

      {/* Sticky Notes */}
      {notes.map(note => {
        const colorConfig = COLORS.find(c => c.value === note.color) || COLORS[0];
        
        return (
          <Card
            key={note.id}
            className={cn(
              "absolute shadow-lg border-2 transition-all duration-200",
              colorConfig.value,
              colorConfig.border,
              activeNote === note.id && "ring-2 ring-blue-400",
              note.isCollapsed && "cursor-pointer"
            )}
            style={{
              left: note.position.x,
              top: note.position.y,
              width: note.isCollapsed ? 40 : note.size.width,
              height: note.isCollapsed ? 40 : note.size.height,
              zIndex: activeNote === note.id ? 30 : 20
            }}
            onClick={() => note.isCollapsed && toggleCollapse(note.id)}
          >
            {note.isCollapsed ? (
              // Collapsed state - arrow only
              <div className="w-full h-full flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
            ) : (
              <>
                {/* Note Header */}
                <CardHeader className="p-2 cursor-move bg-black/5 rounded-t">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-1 flex-1"
                      onMouseDown={(e) => handleMouseDown(e, note.id, 'move')}
                    >
                      <GripVertical className="w-4 h-4 text-gray-500" />
                      <StickyNote className="w-4 h-4 text-gray-600" />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Color Picker */}
                      <div className="flex gap-1">
                        {COLORS.slice(0, 3).map(color => (
                          <button
                            key={color.name}
                            className={cn(
                              "w-3 h-3 rounded-full border",
                              color.value,
                              color.border
                            )}
                            onClick={() => updateNoteColor(note.id, color.value)}
                          />
                        ))}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-white/50"
                        onClick={() => toggleCollapse(note.id)}
                      >
                        <Minimize2 className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100"
                        onClick={() => deleteNote(note.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Note Content */}
                <CardContent className="p-2 flex-1 flex flex-col">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 mb-2 pb-1 border-b border-black/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 hover:bg-white/50"
                      onClick={() => formatText(note.id, 'bullets')}
                    >
                      <List className="w-3 h-3" />
                    </Button>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      Rich Text
                    </Badge>
                  </div>

                  {/* Text Area */}
                  <Textarea
                    value={note.content}
                    onChange={(e) => updateNoteContent(note.id, e.target.value)}
                    placeholder="Type your note here... Press List button to convert to bullet points"
                    className="flex-1 resize-none border-none bg-transparent p-0 focus:ring-0 text-sm"
                    style={{ minHeight: note.size.height - 120 }}
                  />
                </CardContent>

                {/* Resize Handle */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
                  onMouseDown={(e) => handleMouseDown(e, note.id, 'resize')}
                >
                  <div className="w-full h-full">
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400"></div>
                  </div>
                </div>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
};
