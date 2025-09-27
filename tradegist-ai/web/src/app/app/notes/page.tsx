'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/date'
import { Note } from '@/lib/types'

// Mock data
const mockNotes: Note[] = [
  {
    id: '1',
    user_id: 'user1',
    trade_id: 'trade1',
    content: 'Great entry on AAPL. Waited for the pullback as planned and got filled at my target price. Feeling confident about this position.',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    content: 'Market seems choppy today. Going to reduce position sizes and be more selective with entries. Need to stay disciplined.',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    user_id: 'user1',
    trade_id: 'trade2',
    content: 'Stopped out of TSLA. Should have trusted my initial analysis instead of second-guessing. Lesson learned about sticking to the plan.',
    created_at: '2024-01-13T16:45:00Z',
    updated_at: '2024-01-13T16:45:00Z'
  }
]

export default function NotesPage() {
  const [notes, setNotes] = useState(mockNotes)
  const [newNote, setNewNote] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      user_id: 'user1',
      content: newNote,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setNotes([note, ...notes])
    setNewNote('')
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trading Notes</h1>
          <p className="text-muted-foreground">
            Keep track of your thoughts, insights, and lessons learned
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your trading note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <div className="flex space-x-2">
              <Button onClick={handleAddNote}>Save Note</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(note.created_at)}
                      </span>
                      {note.trade_id && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                          Trade Note
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{note.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first trading note'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Note
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}