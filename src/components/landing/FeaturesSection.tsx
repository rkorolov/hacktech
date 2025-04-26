// TODO: UPDATE THE TEXT TO REFLECT THE APP MARKETING

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, CalendarDays, FileText } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Patient Profiles',
      description: 'Patients can easily manage their personal details, medical history, and insurance information.',
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      title: 'Caregiver Coordination',
      description: 'Caregivers can view assigned patients, access necessary details, and add progress notes.',
    },
    {
      icon: <CalendarDays className="h-8 w-8 text-accent" />,
      title: 'Appointment Scheduling',
      description: 'Effortlessly schedule, view, and manage appointments for both patients and caregivers.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Secure Data Management',
      description: 'Your health information is stored securely and accessed only by authorized individuals.',
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-4">
            Comprehensive Care Coordination
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform provides the tools needed for efficient healthcare management for patients and caregivers alike.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto bg-muted rounded-full p-3 w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="tracking-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}