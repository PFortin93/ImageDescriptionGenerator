"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export type Session = {
  id: string;
  name: string;
  images: { file: File; description: string }[];
};

type SidebarProps = {
  currentSession: Session | null;
  onSessionChange: (session: Session) => void;
};

export default function Sidebar({ currentSession, onSessionChange }: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionName, setNewSessionName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedSessions = localStorage.getItem('imageSessions');
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('imageSessions', JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = () => {
    if (newSessionName.trim() === '') {
      toast({
        title: "Error",
        description: "Session name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    const newSession: Session = {
      id: Date.now().toString(),
      name: newSessionName,
      images: [],
    };
    setSessions([...sessions, newSession]);
    setNewSessionName('');
    onSessionChange(newSession);
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
    if (currentSession?.id === id) {
      onSessionChange(sessions[0] || null);
    }
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Sessions</h2>
      <div className="flex mb-4">
        <Input
          type="text"
          placeholder="New session name"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          className="mr-2"
        />
        <Button onClick={createNewSession}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              currentSession?.id === session.id ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            onClick={() => onSessionChange(session)}
          >
            <span className="truncate">{session.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}