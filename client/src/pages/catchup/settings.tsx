import React, { useState } from 'react';
import { CatchUpLayout } from '../../components/catchup/Layout';
import { 
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Clock,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  Check,
  Save
} from 'lucide-react';
import '../../styles/catchup.css';

type SettingsOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type ThemeOption = 'light' | 'dark' | 'system';
type LanguageOption = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';
type TimeFormatOption = '12h' | '24h';
type WeekStartOption = 'sunday' | 'monday';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>('profile');
  
  // Profile settings state
  const [profileFormData, setProfileFormData] = useState({
    firstName: 'Alex',
    lastName: 'Wilson',
    email: 'alex.wilson@example.com',
    jobTitle: 'Product Manager',
    company: 'CatchUp Inc.',
    phone: '+1 (555) 123-4567',
    bio: 'Product manager with 5+ years of experience in tech. Passionate about creating user-friendly productivity tools.',
  });
  
  // Appearance settings state
  const [themePreference, setThemePreference] = useState<ThemeOption>('system');
  const [accentColor, setAccentColor] = useState<string>('#1E5EFF');
  const [fontScale, setFontScale] = useState<number>(1);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [notificationSounds, setNotificationSounds] = useState<boolean>(true);
  const [reminderNotifications, setReminderNotifications] = useState<boolean>(true);
  const [marketingEmails, setMarketingEmails] = useState<boolean>(false);
  
  // Regional settings state
  const [language, setLanguage] = useState<LanguageOption>('en');
  const [timeFormat, setTimeFormat] = useState<TimeFormatOption>('12h');
  const [weekStart, setWeekStart] = useState<WeekStartOption>('sunday');
  const [timezone, setTimezone] = useState<string>('America/New_York');
  
  // Setting sections
  const settingsSections: SettingsOption[] = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'regional', label: 'Regional Settings', icon: <Globe size={20} /> },
    { id: 'password', label: 'Password & Security', icon: <Lock size={20} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={20} /> },
    { id: 'integrations', label: 'Integrations', icon: <Clock size={20} /> },
    { id: 'billing', label: 'Billing & Subscription', icon: <CreditCard size={20} /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle size={20} /> },
  ];
  
  // Theme options
  const themeOptions: {id: ThemeOption, label: string, icon: React.ReactNode}[] = [
    { id: 'light', label: 'Light', icon: <Sun size={18} /> },
    { id: 'dark', label: 'Dark', icon: <Moon size={18} /> },
    { id: 'system', label: 'System Default', icon: <Laptop size={18} /> },
  ];
  
  // Language options
  const languageOptions: {id: LanguageOption, label: string, nativeName: string}[] = [
    { id: 'en', label: 'English', nativeName: 'English' },
    { id: 'es', label: 'Spanish', nativeName: 'Español' },
    { id: 'fr', label: 'French', nativeName: 'Français' },
    { id: 'de', label: 'German', nativeName: 'Deutsch' },
    { id: 'ja', label: 'Japanese', nativeName: '日本語' },
    { id: 'zh', label: 'Chinese', nativeName: '中文' },
  ];
  
  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic would go here
    console.log('Saved settings');
  };

  return (
    <CatchUpLayout>
      <div className="catchup-flex catchup-flex-col h-full">
        {/* Header */}
        <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-6">
          <div>
            <h1 className="catchup-heading-lg">Settings</h1>
            <p className="catchup-text-sm text-[var(--catchup-gray)]">
              Customize your experience
            </p>
          </div>
        </div>
        
        <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-12 gap-6">
          {/* Settings Navigation */}
          <div className="md:col-span-3 lg:col-span-2">
            <div className="catchup-card catchup-p-4">
              <div className="catchup-flex catchup-flex-col gap-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    className={`catchup-nav-link ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="catchup-nav-icon">{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
                
                <div className="border-t border-[var(--catchup-navy-dark)] my-2"></div>
                
                <button className="catchup-nav-link text-red-400">
                  <span className="catchup-nav-icon"><LogOut size={20} /></span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Settings Content */}
          <div className="md:col-span-9 lg:col-span-10">
            <div className="catchup-card catchup-p-4">
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="catchup-heading-md mb-6">Profile Settings</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="catchup-flex catchup-items-center catchup-gap-6 mb-8">
                      <div className="w-20 h-20 rounded-full bg-[var(--catchup-cobalt-light)] flex items-center justify-center flex-shrink-0">
                        <User size={32} />
                      </div>
                      <div>
                        <h3 className="catchup-heading-sm mb-1">Profile Picture</h3>
                        <p className="catchup-text-sm text-[var(--catchup-gray)] mb-3">
                          Upload a new profile picture or avatar
                        </p>
                        <div className="catchup-flex catchup-items-center catchup-gap-3">
                          <button type="button" className="catchup-button catchup-button-secondary">
                            Upload New
                          </button>
                          <button type="button" className="catchup-button catchup-button-ghost text-red-400">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="catchup-label">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="catchup-input"
                          value={profileFormData.firstName}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="catchup-label">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="catchup-input"
                          value={profileFormData.lastName}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="catchup-label">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="catchup-input"
                        value={profileFormData.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="jobTitle" className="catchup-label">Job Title</label>
                        <input
                          type="text"
                          id="jobTitle"
                          name="jobTitle"
                          className="catchup-input"
                          value={profileFormData.jobTitle}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="catchup-label">Company</label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          className="catchup-input"
                          value={profileFormData.company}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="phone" className="catchup-label">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="catchup-input"
                        value={profileFormData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="bio" className="catchup-label">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        className="catchup-input"
                        value={profileFormData.bio}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="catchup-flex catchup-justify-end">
                      <button type="submit" className="catchup-button catchup-button-primary">
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Appearance Settings */}
              {activeSection === 'appearance' && (
                <div>
                  <h2 className="catchup-heading-md mb-6">Appearance Settings</h2>
                  
                  <div className="mb-6">
                    <h3 className="catchup-heading-sm mb-4">Theme Preference</h3>
                    <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-3 gap-4">
                      {themeOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-4 rounded-md border-2 cursor-pointer ${
                            themePreference === option.id
                              ? 'border-[var(--catchup-cobalt)] bg-[var(--catchup-navy-light)]'
                              : 'border-[var(--catchup-navy-dark)] bg-transparent'
                          }`}
                          onClick={() => setThemePreference(option.id)}
                        >
                          <div className="catchup-flex catchup-items-center catchup-justify-between mb-3">
                            <div className="catchup-flex catchup-items-center catchup-gap-2">
                              {option.icon}
                              <span className="catchup-text font-medium">{option.label}</span>
                            </div>
                            {themePreference === option.id && (
                              <div className="w-5 h-5 rounded-full bg-[var(--catchup-cobalt)] flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div 
                            className={`w-full h-20 rounded-md ${
                              option.id === 'light' 
                                ? 'bg-gray-100' 
                                : option.id === 'dark' 
                                ? 'bg-gray-800' 
                                : 'bg-gradient-to-r from-gray-800 to-gray-100'
                            }`}
                          >
                            <div className={`w-1/3 h-3 rounded-sm mt-2 ml-2 ${
                              option.id === 'light' ? 'bg-gray-400' : 'bg-gray-600'
                            }`}></div>
                            <div className={`w-2/3 h-3 rounded-sm mt-2 ml-2 ${
                              option.id === 'light' ? 'bg-gray-300' : 'bg-gray-700'
                            }`}></div>
                            <div className={`w-1/2 h-3 rounded-sm mt-2 ml-2 ${
                              option.id === 'light' ? 'bg-gray-200' : 'bg-gray-600'
                            }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="catchup-heading-sm mb-4">Accent Color</h3>
                    <div className="catchup-grid catchup-grid-cols-6 gap-3 mb-4">
                      {['#1E5EFF', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'].map((color) => (
                        <button
                          key={color}
                          className={`w-10 h-10 rounded-full ${
                            accentColor === color ? 'ring-2 ring-offset-2 ring-white' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setAccentColor(color)}
                          aria-label={`Set accent color to ${color}`}
                        />
                      ))}
                    </div>
                    <div className="catchup-flex catchup-items-center catchup-gap-2">
                      <span className="catchup-text-sm text-[var(--catchup-gray)]">Custom color:</span>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="catchup-heading-sm mb-4">Font Size</h3>
                    <div className="catchup-flex catchup-items-center catchup-gap-4">
                      <span className="catchup-text-sm text-[var(--catchup-gray)]">A</span>
                      <input
                        type="range"
                        min="0.8"
                        max="1.4"
                        step="0.1"
                        value={fontScale}
                        onChange={(e) => setFontScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-[var(--catchup-navy-dark)] rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="catchup-text-lg text-[var(--catchup-gray)]">A</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="catchup-heading-sm mb-4">Accessibility</h3>
                    <div className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]">
                      <div>
                        <p className="catchup-text font-medium">Reduced Motion</p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">
                          Minimize animations throughout the interface
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={reducedMotion}
                          onChange={() => setReducedMotion(!reducedMotion)}
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          reducedMotion 
                            ? 'bg-[var(--catchup-cobalt)]' 
                            : 'bg-[var(--catchup-navy-light)]'
                        } peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="catchup-flex catchup-justify-end">
                    <button className="catchup-button catchup-button-primary">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
              
              {/* Notifications Settings */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="catchup-heading-md mb-6">Notification Settings</h2>
                  
                  <div className="mb-6 space-y-4">
                    <div className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]">
                      <div>
                        <p className="catchup-text font-medium">Email Notifications</p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          emailNotifications 
                            ? 'bg-[var(--catchup-cobalt)]' 
                            : 'bg-[var(--catchup-navy-light)]'
                        } peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                    
                    <div className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]">
                      <div>
                        <p className="catchup-text font-medium">Push Notifications</p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">
                          Receive notifications on your device
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={pushNotifications}
                          onChange={() => setPushNotifications(!pushNotifications)}
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          pushNotifications 
                            ? 'bg-[var(--catchup-cobalt)]' 
                            : 'bg-[var(--catchup-navy-light)]'
                        } peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                    
                    <div className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]">
                      <div>
                        <p className="catchup-text font-medium">Notification Sounds</p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">
                          Play sounds for notifications
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSounds}
                          onChange={() => setNotificationSounds(!notificationSounds)}
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          notificationSounds 
                            ? 'bg-[var(--catchup-cobalt)]' 
                            : 'bg-[var(--catchup-navy-light)]'
                        } peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                    
                    <div className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]">
                      <div>
                        <p className="catchup-text font-medium">Task Reminders</p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">
                          Receive reminders about upcoming tasks
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={reminderNotifications}
                          onChange={() => setReminderNotifications(!reminderNotifications)}
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          reminderNotifications 
                            ? 'bg-[var(--catchup-cobalt)]' 
                            : 'bg-[var(--catchup-navy-light)]'
                        } peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                    
                    <div className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]">
                      <div>
                        <p className="catchup-text font-medium">Marketing Emails</p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">
                          Receive product updates and promotional emails
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={marketingEmails}
                          onChange={() => setMarketingEmails(!marketingEmails)}
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          marketingEmails 
                            ? 'bg-[var(--catchup-cobalt)]' 
                            : 'bg-[var(--catchup-navy-light)]'
                        } peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="catchup-flex catchup-justify-end">
                    <button className="catchup-button catchup-button-primary">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
              
              {/* Regional Settings */}
              {activeSection === 'regional' && (
                <div>
                  <h2 className="catchup-heading-md mb-6">Regional Settings</h2>
                  
                  <div className="mb-6">
                    <h3 className="catchup-heading-sm mb-3">Language</h3>
                    <select
                      className="catchup-input mb-2"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                    >
                      {languageOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} ({option.nativeName})
                        </option>
                      ))}
                    </select>
                    <p className="catchup-text-sm text-[var(--catchup-gray)] mb-6">
                      This will change the language across the entire application
                    </p>
                    
                    <h3 className="catchup-heading-sm mb-3">Time Format</h3>
                    <div className="catchup-flex catchup-gap-4 mb-6">
                      <label className="catchup-flex catchup-items-center catchup-gap-2">
                        <input
                          type="radio"
                          checked={timeFormat === '12h'}
                          onChange={() => setTimeFormat('12h')}
                          className="w-4 h-4 text-[var(--catchup-cobalt)]"
                        />
                        <span>12-hour (1:30 PM)</span>
                      </label>
                      <label className="catchup-flex catchup-items-center catchup-gap-2">
                        <input
                          type="radio"
                          checked={timeFormat === '24h'}
                          onChange={() => setTimeFormat('24h')}
                          className="w-4 h-4 text-[var(--catchup-cobalt)]"
                        />
                        <span>24-hour (13:30)</span>
                      </label>
                    </div>
                    
                    <h3 className="catchup-heading-sm mb-3">Week Starts On</h3>
                    <div className="catchup-flex catchup-gap-4 mb-6">
                      <label className="catchup-flex catchup-items-center catchup-gap-2">
                        <input
                          type="radio"
                          checked={weekStart === 'sunday'}
                          onChange={() => setWeekStart('sunday')}
                          className="w-4 h-4 text-[var(--catchup-cobalt)]"
                        />
                        <span>Sunday</span>
                      </label>
                      <label className="catchup-flex catchup-items-center catchup-gap-2">
                        <input
                          type="radio"
                          checked={weekStart === 'monday'}
                          onChange={() => setWeekStart('monday')}
                          className="w-4 h-4 text-[var(--catchup-cobalt)]"
                        />
                        <span>Monday</span>
                      </label>
                    </div>
                    
                    <h3 className="catchup-heading-sm mb-3">Time Zone</h3>
                    <select
                      className="catchup-input"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="America/New_York">Eastern Time (ET) - New York</option>
                      <option value="America/Chicago">Central Time (CT) - Chicago</option>
                      <option value="America/Denver">Mountain Time (MT) - Denver</option>
                      <option value="America/Los_Angeles">Pacific Time (PT) - Los Angeles</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT) - London</option>
                      <option value="Europe/Paris">Central European Time (CET) - Paris</option>
                      <option value="Asia/Tokyo">Japan Standard Time (JST) - Tokyo</option>
                    </select>
                  </div>
                  
                  <div className="catchup-flex catchup-justify-end">
                    <button className="catchup-button catchup-button-primary">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
              
              {/* Other Sections (Placeholders) */}
              {(activeSection === 'password' || 
                activeSection === 'privacy' || 
                activeSection === 'integrations' || 
                activeSection === 'billing' || 
                activeSection === 'help') && (
                <div className="text-center py-8">
                  <h2 className="catchup-heading-md mb-4">
                    {settingsSections.find(s => s.id === activeSection)?.label} Settings
                  </h2>
                  <p className="catchup-text-sm text-[var(--catchup-gray)] max-w-md mx-auto">
                    This settings section is currently under development and will be available soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CatchUpLayout>
  );
}