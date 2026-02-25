'use client';

import { useState } from 'react';
import RagGallery from './RagGallery';
import RagChat from './RagChat';
import AdminView from './admin/AdminView';

type View = 'gallery' | 'chat' | 'admin';

interface Props {
  onClose?: () => void;
}

export default function RagView({ onClose }: Props) {
  const [view, setView] = useState<View>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (view === 'admin') {
    return <AdminView onBack={() => setView('gallery')} />;
  }

  if (view === 'chat' && selectedCategory) {
    return <RagChat categoryId={selectedCategory} onBack={() => setView('gallery')} />;
  }

  return (
    <RagGallery
      onSelectCategory={id => { setSelectedCategory(id); setView('chat'); }}
      onAdmin={() => setView('admin')}
      onClose={onClose}
    />
  );
}
