
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Sun, Moon, Settings, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ThemeSelectorProps {
  currentTheme: string;
  isDarkMode: boolean;
  onThemeChange: (theme: string) => void;
  onModeChange: (isDark: boolean) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  isDarkMode,
  onThemeChange,
  onModeChange
}) => {
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1e293b'
  });
  const [borderRadius, setBorderRadius] = useState(8);
  const [shadowIntensity, setShadowIntensity] = useState(50);

  const themes = [
    { id: 'classic', name: 'Classic Blue', icon: '🔵' },
    { id: 'modern', name: 'Modern Purple', icon: '🟣' },
    { id: 'nature', name: 'Nature Green', icon: '🟢' },
    { id: 'sunset', name: 'Sunset Orange', icon: '🟠' },
    { id: 'ocean', name: 'Ocean Teal', icon: '🔷' },
    { id: 'custom', name: 'Custom', icon: '🎨' }
  ];

  const saveCustomTheme = () => {
    const themeConfig = {
      colors: customColors,
      borderRadius,
      shadowIntensity,
      darkMode: isDarkMode
    };
    localStorage.setItem('dashboard-custom-theme', JSON.stringify(themeConfig));
  };

  const loadCustomTheme = () => {
    const saved = localStorage.getItem('dashboard-custom-theme');
    if (saved) {
      const config = JSON.parse(saved);
      setCustomColors(config.colors);
      setBorderRadius(config.borderRadius);
      setShadowIntensity(config.shadowIntensity);
      onModeChange(config.darkMode);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 mb-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Palette className="w-4 h-4" />
            Theme
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800">Theme Customization</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={isDarkMode ? () => onModeChange(false) : () => onModeChange(true)}
                className="gap-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Light' : 'Dark'}
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Pre-built Themes</Label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((theme) => (
                  <Button
                    key={theme.id}
                    variant={currentTheme === theme.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onThemeChange(theme.id)}
                    className="flex flex-col items-center gap-1 h-16 text-xs"
                  >
                    <span className="text-lg">{theme.icon}</span>
                    <span className="text-xs">{theme.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {currentTheme === 'custom' && (
              <div className="space-y-4 border-t pt-4">
                <Label className="text-sm font-medium">Custom Colors</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Primary</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                        className="w-8 h-8 rounded border"
                      />
                      <span className="text-xs text-slate-600">{customColors.primary}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Secondary</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.secondary}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                        className="w-8 h-8 rounded border"
                      />
                      <span className="text-xs text-slate-600">{customColors.secondary}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Accent</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accent}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                        className="w-8 h-8 rounded border"
                      />
                      <span className="text-xs text-slate-600">{customColors.accent}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Background</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.background}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, background: e.target.value }))}
                        className="w-8 h-8 rounded border"
                      />
                      <span className="text-xs text-slate-600">{customColors.background}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Border Radius: {borderRadius}px</Label>
                    <Slider
                      value={[borderRadius]}
                      onValueChange={(value) => setBorderRadius(value[0])}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Shadow Intensity: {shadowIntensity}%</Label>
                    <Slider
                      value={[shadowIntensity]}
                      onValueChange={(value) => setShadowIntensity(value[0])}
                      max={100}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={saveCustomTheme} className="flex-1 gap-2">
                    <Save className="w-3 h-3" />
                    Save Theme
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadCustomTheme}>
                    Load Saved
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
