/**
 * Utility functions for chart data formatting and styling
 */

// Color palette for charts (MMU theme colors)
export const chartColors = {
  primary: 'rgba(0, 128, 0, 0.7)', // MMU Green
  primaryLight: 'rgba(0, 128, 0, 0.3)',
  secondary: 'rgba(220, 53, 69, 0.7)', // MMU Red
  secondaryLight: 'rgba(220, 53, 69, 0.3)',
  accent: 'rgba(255, 193, 7, 0.7)', // Gold
  accentLight: 'rgba(255, 193, 7, 0.3)',
  neutral: 'rgba(108, 117, 125, 0.7)',
  neutralLight: 'rgba(108, 117, 125, 0.3)',
  success: 'rgba(40, 167, 69, 0.7)',
  successLight: 'rgba(40, 167, 69, 0.3)',
  info: 'rgba(23, 162, 184, 0.7)',
  infoLight: 'rgba(23, 162, 184, 0.3)',
  warning: 'rgba(255, 193, 7, 0.7)',
  warningLight: 'rgba(255, 193, 7, 0.3)',
  danger: 'rgba(220, 53, 69, 0.7)',
  dangerLight: 'rgba(220, 53, 69, 0.3)',
};

// Generate a color array from the palette for multiple data points
export const generateColorArray = (count: number, alpha: number = 0.7) => {
  const baseColors = [
    `rgba(0, 128, 0, ${alpha})`, // MMU Green
    `rgba(220, 53, 69, ${alpha})`, // MMU Red
    `rgba(255, 193, 7, ${alpha})`, // Gold
    `rgba(23, 162, 184, ${alpha})`, // Cyan
    `rgba(111, 66, 193, ${alpha})`, // Purple
    `rgba(40, 167, 69, ${alpha})`, // Green
    `rgba(0, 123, 255, ${alpha})`, // Blue
    `rgba(253, 126, 20, ${alpha})`, // Orange
  ];
  
  // If we need more colors than in our base array, we'll cycle through them
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};

// Format date for charts
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format time for charts
export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  
  return `${mins}m`;
};

// Format percentage for charts
export const formatPercentage = (value: number) => {
  return `${Math.round(value)}%`;
};

// Generate gradient for area charts
export const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color.replace('0.7', '0.5'));
  gradient.addColorStop(1, color.replace('0.7', '0.0'));
  return gradient;
};

// Chart options for consistent styling
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          family: "'Inter', sans-serif",
          size: 12
        },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleFont: {
        family: "'Inter', sans-serif",
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        family: "'Inter', sans-serif",
        size: 13
      },
      padding: 12,
      cornerRadius: 8,
      usePointStyle: true
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
          size: 11
        }
      }
    },
    y: {
      grid: {
        borderDash: [2, 4],
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
          size: 11
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  }
};

// Format activity data for time series charts
export const formatActivityData = (data: any[], timeRange: string) => {
  // Group by date and activity type
  const groupedData: Record<string, Record<string, number>> = {};
  
  data.forEach(item => {
    const date = formatDate(item.created_at);
    if (!groupedData[date]) {
      groupedData[date] = {};
    }
    
    if (!groupedData[date][item.activity_type]) {
      groupedData[date][item.activity_type] = 0;
    }
    
    groupedData[date][item.activity_type] += item.count;
  });
  
  // Get all unique dates and activity types
  const dates = Object.keys(groupedData).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  const activityTypes = Array.from(
    new Set(data.map(item => item.activity_type))
  );
  
  // Create datasets for each activity type
  const datasets = activityTypes.map((type, index) => {
    return {
      label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: dates.map(date => groupedData[date][type] || 0),
      borderColor: Object.values(chartColors)[index % Object.values(chartColors).length],
      backgroundColor: Object.values(chartColors)[index % Object.values(chartColors).length].replace('0.7', '0.1'),
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  });
  
  return {
    labels: dates,
    datasets
  };
};
