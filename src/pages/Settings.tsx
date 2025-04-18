import React from 'react';
import { Moon, Bell, Lock, Eye, Palette, Volume2, Globe2, HelpCircle } from 'lucide-react';

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-b border-gray-700 py-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {children}
  </div>
);

const SettingItem = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="flex items-start gap-4 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer rounded-lg">
    <div className="p-2 bg-gray-800 rounded-full">
      <Icon className="w-6 h-6 text-purple-500" />
    </div>
    <div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-gray-400 text-sm mt-1">{description}</p>
    </div>
  </div>
);

const Settings = () => {
  return (
    <main className="min-h-screen ml-64">
      <div className="max-w-2xl border-x border-gray-700">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/50 border-b border-gray-700">
          <h1 className="text-xl font-bold p-4">Settings</h1>
        </header>

        <div className="p-4">
          <SettingsSection title="Appearance">
            <SettingItem
              icon={Moon}
              title="Dark Mode"
              description="Manage your color theme preferences"
            />
            <SettingItem
              icon={Palette}
              title="Display"
              description="Manage your font size, color, and background"
            />
          </SettingsSection>

          <SettingsSection title="Privacy and Safety">
            <SettingItem
              icon={Lock}
              title="Privacy"
              description="Manage what information you see and share"
            />
            <SettingItem
              icon={Eye}
              title="Visibility"
              description="Manage who can see your posts"
            />
          </SettingsSection>

          <SettingsSection title="Notifications">
            <SettingItem
              icon={Bell}
              title="Notifications"
              description="Manage your notification preferences"
            />
            <SettingItem
              icon={Volume2}
              title="Sounds"
              description="Manage your sound preferences"
            />
          </SettingsSection>

          <SettingsSection title="Additional Resources">
            <SettingItem
              icon={Globe2}
              title="Language"
              description="Manage your language preferences"
            />
            <SettingItem
              icon={HelpCircle}
              title="Help Center"
              description="Visit the help center for assistance"
            />
          </SettingsSection>
        </div>
      </div>
    </main>
  );
};

export default Settings;