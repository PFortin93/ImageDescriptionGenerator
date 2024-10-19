"use client"

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import Sidebar, { Session } from '@/components/Sidebar';

export default function Home() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  return (
    <>
      <Sidebar currentSession={currentSession} onSessionChange={setCurrentSession} />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Bulk Image Description Generator</h1>
        <ImageUpload currentSession={currentSession} onSessionUpdate={setCurrentSession} />
      </div>
    </>
  );
}