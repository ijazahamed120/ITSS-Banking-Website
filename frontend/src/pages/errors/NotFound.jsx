import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-sm border border-[#E2E5EA]">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-[#1E3A5F] flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            HTTP 404 Not Found
          </span>
          <h2 className="text-xl font-bold text-[#111827]">Page Not Found</h2>
          <p className="text-xs text-[#6B7280]">
            The requested console route does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Go Back
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Return to Main Console
          </Button>
        </div>
      </Card>
    </div>
  );
}
