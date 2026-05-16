// Sidebar

import { ApexOptions } from 'apexcharts';

export function getBarOptionsSidebar(
  categories: string[],
  dataOrig: number[],
): ApexOptions {
  return {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '40px',
      },
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: 'right',
        offsetX: -23,
        offsetY: 0,
      },
      y: {
        formatter: function (value, { dataPointIndex }) {
          console.log({ dataOrig });
          console.log({ dataPointIndex });
          return String(dataOrig[dataPointIndex]);
        },
      },
      style: {
        fontSize: '12px',
      },
      theme: 'dark',
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter(value: string): string | string[] {
          return value.split(',')[0];
        },
        show: true,
        style: {
          colors: '#FFFFFF',
          fontSize: '12px',
          fontWeight: '500',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      labels: {
        show: true,
        style: {
          colors: '#CBD5E0',
          fontSize: '12px',
        },
      },
    },
    grid: {
      show: false,
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      type: 'solid',
      colors: ['#FFFFFF'],
      opacity: 1,
    },
    dataLabels: {
      enabled: false,
    },
  };
}

export function getBarUsage(categories: string[]): ApexOptions {
  return {
    tooltip: {
      theme: 'dark',
    },
    chart: {
      height: 'auto',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },

      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000,
        },
      },
    },

    markers: {
      size: 0,
      colors: '#7551FF',
      strokeColors: 'white',
      strokeWidth: 2,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      shape: 'circle',
      radius: 2,
      offsetX: 0,
      offsetY: 0,
      showNullDataPoints: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      categories,
      offsetY: 10,
      labels: {
        rotate: -40,
        rotateAlways: true,
        style: {
          colors: '#A3AED0',
          fontSize: '12px',
          fontWeight: '500',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          colors: '#A3AED0',
          fontSize: '12px',
          fontWeight: '500',
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
      column: {
        opacity: 0.5,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0.1,
        opacityFrom: 0.3,
        opacityTo: 0.9,
        colorStops: [
          [
            {
              offset: 0,
              color: '#7551FF',
              opacity: 1,
            },
            {
              offset: 100,
              color: '#7551FF',
              opacity: 1,
            },
          ],
          [
            {
              offset: 0,
              color: '#7551FF',
              opacity: 1,
            },
            {
              offset: 100,
              color: '#39B8FF',
              opacity: 1,
            },
          ],
        ],
      },
    },
  };
}
