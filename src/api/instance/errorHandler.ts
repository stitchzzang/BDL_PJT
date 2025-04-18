// 상수 정의
import { HTTPError } from 'ky';
import { toast } from 'react-toastify';

const ERROR_CODES = {
  EXPIRED_ACCESS_TOKEN: 401,
  // 1000번대: 회원 관련 오류
  NOT_FOUND_MEMBER: 1000,
  DUPLICATE_NICKNAME: 1001,
  INVALID_SECURITY_ANSWER: 1002,
  DUPLICATE_EMAIL: 1003,
  REFRESH_AUTHORIZATION_FAIL: 1004,
  BAD_REQUEST_MEMBER: 1005,
  NOT_MATCH_MEMBER: 1006,
  NOT_FOUND_JWT: 1007,

  // 2000번대: 기업 관련 오류
  NOT_FOUND_COMPANY: 2000,

  // 5000번대: 주식 관련 오류
  DATA_DUPLICATION_STOCK: 5000,
  NOT_FOUND_STOCK: 5001,
  NO_MORE_STOCK_DATA: 5002,
  INVALID_REQUEST_TIME: 5003,
  STOCK_DAILY_NOT_FOUND: 5004,

  // 5100번대: 시뮬레이션 관련 오류
  INSUFFICIENT_FUNDS: 5100,
  INSUFFICIENT_MYSTOCK: 5101,
  NOT_FOUND_ORDER: 5102,
  ALREADY_CONFIRMED_ORDER: 5103,
  NOT_FOUND_STOCK_DAILY: 5104,
  SIMULATION_BAD_REQUEST: 5105,
  MARKET_CLOSED: 5106,

  // 6000번대: 알고리즘 관련 오류
  NOT_FOUND_ALGORITHM: 6000,
  UNAUTHORIZED_ALGORITHM_ACCESS: 6001,
  INVALID_ALGORITHM_PARAMS: 6002,
  ALGORITHM_EXECUTION_ERROR: 6003,

  // 6100번대: 알고리즘 회사 관련 오류
  NOT_FOUND_ALGORITHM_COMPANY: 6100,
  ALGORITHM_ALREADY_RUNNING: 6101,
  ALGORITHM_NOT_RUNNING: 6102,

  // 6200번대: 백테스트 관련 오류
  MINUTE_DATA_NOT_SUPPORTED: 6201,

  // 7000번대: 변곡점 관련 오류
  POINT_NOT_FOUND: 7000,
  DUPLICATE_TURNING_POINT: 7001,
  INSUFFICIENT_TURNING_POINTS: 7002,

  // 7100번대: 튜토리얼(교육) 관련 오류
  NEWS_NOT_FOUND: 7100,
  TRADING_DATE_NOT_FOUND: 7101,
  STOCK_CANDLE_NOT_FOUND: 7102,
  INVALID_TUTORIAL_SESSION: 7103,
  INSUFFICIENT_CASH: 7104,
  INSUFFICIENT_STOCK: 7105,
  UNKNOWN_TUTORIAL_ACTION: 7106,
  STOCK_DATA_EMPTY: 7107,

  // 7200번대: 뉴스 크롤링 관련 오류
  NEWS_CRAWLING_ERROR: 7201,
  NEWS_COMPANY_NOT_FOUND: 7202,
  NEWS_CRAWLING_INSUFFICIENT_RESULTS: 7203,
  NEWS_URL_MISSING: 7204,
  NEWS_DUPLICATE_ENTRY: 7205,
  NEWS_DATE_PARSE_ERROR: 7206,

  // 9000번대: AWS S3 관련 오류
  AWS_SERVER_ERROR: 9001,
  AWS_FILE_NOT_FOUND: 9002,
  AWS_UPLOAD_FAILED: 9003,
  AWS_DELETE_FAILED: 9004,
  AWS_INVALID_FILE_FORMAT: 9005,
  AWS_FILE_SIZE_EXCEEDED: 9006,
  AWS_BUCKET_NOT_FOUND: 9007,

  // 공통 오류 코드
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

/**
 * KY 라이브러리 HTTP 에러 처리 함수
 * @param {HTTPError} error - KY 라이브러리 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 */
const handleKyError = (error: HTTPError, defaultMessage = '요청 처리 중 오류가 발생했습니다.') => {
  try {
    if (error.response) {
      error.response
        .json()
        .then((errorData) => {
          const data = errorData as { message?: string; code?: number };
          // 401 에러 (로그인 관련 에러)인 경우 alert 사용
          if (
            data?.code === ERROR_CODES.UNAUTHORIZED ||
            error.response?.status === ERROR_CODES.UNAUTHORIZED
          ) {
            if (data?.message) {
              alert(data.message);
            } else {
              alert(defaultMessage);
            }
          } else {
            // 다른 에러는 기존처럼 toast 사용
            if (data?.message) {
              toast.error(data.message);
            } else {
              toast.error(defaultMessage);
            }
          }
        })
        .catch(() => {
          // 응답 파싱 실패 시, 상태 코드 기반으로 처리
          if (error.response?.status === ERROR_CODES.UNAUTHORIZED) {
            alert(defaultMessage);
          } else {
            toast.error(defaultMessage);
          }
        });
    } else {
      toast.error(defaultMessage);
    }
  } catch (parseError) {
    toast.error(defaultMessage);
  }
};

/**
 * API 에러 응답 처리 함수
 * @param {object} response - API 응답 객체
 */
const handleApiError = (response: { data: { body: { message: string; code?: number } } }) => {
  const { message, code } = response.data.body;

  // 401 에러 (로그인 관련 에러)인 경우 alert 사용
  if (code === ERROR_CODES.UNAUTHORIZED) {
    alert(message);
  } else {
    toast.error(message);
  }
};

export { ERROR_CODES, handleApiError, handleKyError };
