import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Phone } from 'lucide-react';

interface FollowedCompany {
  id: string;
  company_name: string;
  company_cvr: string;
  company_data: any;
  notification_preferences: any;
  created_at: string;
  updated_at: string;
}

interface NotificationSettingsFormProps {
  company: FollowedCompany;
  onSave: (preferences: { email: boolean; sms: boolean; call: boolean }) => void;
  onCancel: () => void;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  company,
  onSave,
  onCancel
}) => {
  const [preferences, setPreferences] = useState({
    email: company.notification_preferences?.email || false,
    sms: company.notification_preferences?.sms || false,
    call: company.notification_preferences?.call || false,
  });

  const handleCheckboxChange = (type: 'email' | 'sms' | 'call', checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="email"
            checked={preferences.email}
            onCheckedChange={(checked) => handleCheckboxChange('email', checked as boolean)}
          />
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="email" className="text-sm font-medium cursor-pointer">
              Email notifikationer
            </Label>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="sms"
            checked={preferences.sms}
            onCheckedChange={(checked) => handleCheckboxChange('sms', checked as boolean)}
          />
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="sms" className="text-sm font-medium cursor-pointer">
              SMS notifikationer
            </Label>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="call"
            checked={preferences.call}
            onCheckedChange={(checked) => handleCheckboxChange('call', checked as boolean)}
          />
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="call" className="text-sm font-medium cursor-pointer">
              Telefonopkald
            </Label>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
        <p className="font-medium mb-1">Note:</p>
        <p>Du vil kun modtage notifikationer når der sker ændringer i {company.company_name}. SMS og telefonopkald kan medføre ekstra omkostninger fra din udbyder.</p>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuller
        </Button>
        <Button onClick={handleSave}>
          Gem indstillinger
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsForm;