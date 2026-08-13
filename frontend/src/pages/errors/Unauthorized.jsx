import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ROLE_CONFIG } from '../../config/roles.js';

export function Unauthorized({ userRole, allowedRoles = [] }) {
  const navigate = useNavigate();
  const currentRoleName = userRole ? ROLE_CONFIG[userRole]?.name || userRole : 'Unknown Role';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-sm border border-[#E2E5EA]">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-xl font-bold text-[#111827]">Unauthorized Access</h2>
          <p className="text-xs text-[#6B7280]">
            You do not have permission to access this area.
          </p>
        </div>

        {userRole && (
          <div className="p-3 bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg text-left text-xs space-y-1">
            <div className="flex justify-between items-center text-[#6B7280]">
              <span>Your Current Role:</span>
              <span className="font-bold text-[#111827] font-mono">{currentRoleName}</span>
            </div>
            {allowedRoles.length > 0 && (
              <div className="flex justify-between items-center text-[#6B7280] pt-1 border-t border-[#E2E5EA]">
                <span>Required Permission:</span>
                <span className="font-mono text-[11px] text-[#1E3A5F]">
                  {allowedRoles.map((r) => ROLE_CONFIG[r]?.name || r).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

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
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
