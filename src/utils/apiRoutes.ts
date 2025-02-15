export const API_ROUTES = {
  FEEDBACK: '/api/feedback/submit',  // Updated to match backend route
  RESULTS: '/api/results',
  USER: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    PROFILE: '/api/users/profile',
  },
  ASSESSMENT: {
    START: '/api/assessment/start',
    SUBMIT: '/api/assessment/submit',
    LIST: '/api/assessment/list',
  }
};

export const getApiRoute = (route: string): string => {
  if (!API_ROUTES[route]) {
    console.warn(`Route ${route} not found in API_ROUTES`);
    return '';
  }
  return API_ROUTES[route];
};
