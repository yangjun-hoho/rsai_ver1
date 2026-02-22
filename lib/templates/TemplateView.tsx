'use client';

import { useState } from 'react';
import { TemplateConfig } from './types';
import TemplateGallery from './TemplateGallery';
import TemplateRunner from './TemplateRunner';

export default function TemplateView() {
  const [selected, setSelected] = useState<TemplateConfig | null>(null);

  if (selected) {
    return <TemplateRunner template={selected} onBack={() => setSelected(null)} />;
  }

  return <TemplateGallery onSelect={setSelected} />;
}
