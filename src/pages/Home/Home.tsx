import React from 'react';
import { Typography, Button, Card } from '../../components';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Typography variant="h1" className="mb-4 text-gray-900">
            Welcome to Your App
          </Typography>
          <Typography variant="p" className="text-gray-600 mb-8">
            A production-ready React application with Tailwind CSS and Atomic Design
          </Typography>
          <div className="flex justify-center gap-4">
            <Button variant="primary" size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card title="Feature 1">
            <Typography variant="p" className="text-gray-600">
              This is a feature card built with atomic design principles.
            </Typography>
          </Card>
          <Card title="Feature 2">
            <Typography variant="p" className="text-gray-600">
              Components are organized by complexity and reusability.
            </Typography>
          </Card>
          <Card title="Feature 3">
            <Typography variant="p" className="text-gray-600">
              Easy to maintain and scale for production applications.
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

