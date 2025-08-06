import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ServiceCost } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ServiceBreakdownProps {
  services: ServiceCost[];
}

const ServiceBreakdown: React.FC<ServiceBreakdownProps> = ({ services }) => {
  const colors = [
    'rgb(59, 130, 246)',   // Blue
    'rgb(16, 185, 129)',   // Green
    'rgb(245, 158, 11)',   // Yellow
    'rgb(239, 68, 68)',    // Red
    'rgb(139, 92, 246)',   // Purple
    'rgb(236, 72, 153)',   // Pink
    'rgb(6, 182, 212)',    // Cyan
    'rgb(34, 197, 94)',    // Emerald
  ];

  const backgroundColors = colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)'));
  const borderColors = colors;

  const chartData = {
    labels: services.map(service => service.service.replace('Amazon ', '').replace('AWS ', '')),
    datasets: [
      {
        data: services.map(service => service.cost),
        backgroundColor: backgroundColors.slice(0, services.length),
        borderColor: borderColors.slice(0, services.length),
        borderWidth: 2,
        hoverBackgroundColor: colors.slice(0, services.length),
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
          color: 'rgb(75, 85, 99)',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / services.reduce((sum, s) => sum + s.cost, 0)) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '50%',
  };

  const totalCost = services.reduce((sum, service) => sum + service.cost, 0);

  return (
    <div className="h-full">
      <div className="chart-container-small mb-4">
        <Doughnut data={chartData} options={options} />
      </div>
      
      {/* Service List */}
      <div className="space-y-2">
        {services.slice(0, 5).map((service, index) => (
          <div key={service.service} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-sm text-gray-700 truncate">
                {service.service.replace('Amazon ', '').replace('AWS ', '')}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ${service.cost.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {service.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
        
        {services.length > 5 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {services.length - 5} other services
            </span>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ${services.slice(5).reduce((sum, s) => sum + s.cost, 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {services.slice(5).reduce((sum, s) => sum + s.percentage, 0).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceBreakdown;