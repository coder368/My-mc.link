import React, { useState } from 'react';
import { ServerConfig } from '../types';
import { 
  X, 
  Save, 
  RotateCcw, 
  Settings, 
  Check,
  Volume2,
  VolumeX,
  Sun,
  Moon
} from 'lucide-react';
import { DEFAULT_CONFIG } from '../data/defaultConfig';
import { sounds } from '../utils/audio';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ServerConfig;
  onSave: (newConfig: ServerConfig) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  soundEnabled = true,
  onToggleSound
}) => {
  const [formData, setFormData] = useState<ServerConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof ServerConfig, value: any) => {
    if (field === 'javaIp' && typeof value === 'string' && value.includes(':')) {
      const parts = value.split(':');
      const ip = parts[0].trim();
      const port = parseInt(parts[1], 10);
      setFormData(prev => ({
        ...prev,
        javaIp: ip,
        ...(port ? { javaPort: port } : {})
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playLevelUp();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    sounds.playClick();
    setFormData({ ...DEFAULT_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div 
        id="config-settings-modal"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Server & Portal Configuration</h2>
              <p className="text-xs text-zinc-400">Customize connection addresses and telemetry settings</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Server Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              1. Server Identity & Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Server Name</label>
                <input
                  type="text"
                  value={formData.serverName}
                  onChange={(e) => handleChange('serverName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Version Subtitle</label>
                <input
                  type="text"
                  value={formData.mcVersion}
                  onChange={(e) => handleChange('mcVersion', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Tagline / Description</label>
              <input
                type="text"
                value={formData.serverTagline}
                onChange={(e) => handleChange('serverTagline', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Section 2: Connection Addresses */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. Connection Addresses
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-zinc-400 block mb-1">Java IP / Hostname</label>
                <input
                  type="text"
                  value={formData.javaIp}
                  onChange={(e) => handleChange('javaIp', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Java Port</label>
                <input
                  type="number"
                  value={formData.javaPort}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleChange('javaPort', isNaN(val) ? 40891 : val);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Discord & Community */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              3. Community Links
            </h3>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Discord Permanent Invite URL</label>
              <input
                type="url"
                value={formData.discordInviteUrl}
                onChange={(e) => handleChange('discordInviteUrl', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
          </div>

          {/* Section 4: Appearance */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              4. Appearance
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { sounds.playClick(); handleChange('theme', 'midnight'); }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                  formData.theme !== 'light' 
                    ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Moon className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Midnight Theme</span>
                <span className="text-[10px] opacity-70 mt-1">Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => { sounds.playClick(); handleChange('theme', 'light'); }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                  formData.theme === 'light' 
                    ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Sun className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Daylight Theme</span>
                <span className="text-[10px] opacity-70 mt-1">Light Mode</span>
              </button>
            </div>
          </div>

          {/* Section 5: Audio Preferences */}
          {onToggleSound && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                5. Audio Feedback
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">Interactive Audio Effects</div>
                    <div className="text-[10px] text-zinc-500">Subtle click & copy feedback sounds</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onToggleSound();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-emerald-400 text-[#07110d]'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#07110d] text-xs font-bold transition-colors cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
