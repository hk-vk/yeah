import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart2, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { Card } from '../components/common/Card';
import { StatsCard } from '../components/admin/StatsCard';
import { TabButton } from '../components/admin/TabButton';

export default function AdminPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: t.totalAnalyses, value: '12,453' },
    { label: t.accuracyRate, value: '94.2%' },
    { label: t.userFeedback, value: '1,287' }
  ];

  const tabs = [
    { id: 'dashboard', icon: BarChart2, label: t.dashboard },
    { id: 'users', icon: Users, label: t.users },
    { id: 'feedback', icon: MessageSquare, label: t.feedback }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <Card.Header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.adminDashboard}
          </h1>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                label={stat.label}
                value={stat.value}
                index={index}
              />
            ))}
          </div>

          <div className="flex space-x-4 mb-6">
            {tabs.map(({ id, icon, label }) => (
              <TabButton
                key={id}
                id={id}
                icon={icon}
                label={label}
                isActive={activeTab === id}
                onClick={() => setActiveTab(id)}
              />
            ))}
          </div>

          <Card className="bg-gray-50 dark:bg-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-300">
              {t.adminPageContent}
            </p>
          </Card>
        </Card.Body>
      </Card>
    </motion.div>
  );
}
