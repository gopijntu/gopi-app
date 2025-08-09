import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <Button variant="outline" onClick={() => navigate('/home')} className="gap-2">
      <ArrowLeft /> Back
    </Button>
  );
}
