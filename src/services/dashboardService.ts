import api from './api';
import { DashboardStats } from '../types';

const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    // return mock data
    const mockStats: DashboardStats = {
      totalPatients: 124,
      totalVisits: 543,
      opdVisits: 467,
      ipdVisits: 76,
      visitsPerWeek: [
        { week: 'Week 1', count: 45 },
        { week: 'Week 2', count: 52 },
        { week: 'Week 3', count: 48 },
        { week: 'Week 4', count: 61 },
      ],
      commonDiagnoses: [
        { diagnosis: 'Upper Respiratory Infection', count: 67 },
        { diagnosis: 'Hypertension', count: 45 },
        { diagnosis: 'Diabetes Mellitus', count: 38 },
        { diagnosis: 'Musculoskeletal Pain', count: 32 },
        { diagnosis: 'Gastroenteritis', count: 28 },
      ]
    };

    // const response = await api.get('/dashboard/stats');
    // return response.data;
    return mockStats;
  },
};

export default dashboardService;