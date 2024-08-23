export interface Environment {
    WOTLWEDU_API_URL: string;
  }
  
export const GlobalVariable = {
    APP_VERSION: '0.0.1',
    BASE_API_URL: '${WOTLWEDU_API_URL}',
    DEFAULT_START_PAGE: '/home',
    ERROR_COUNTDOWN: 30
};
