// 상수 정의
const ERROR_CODES = {
  // 4000번대: 클라이언트 요청 오류
  DUPLICATE_EMAIL: 4001,
  NOT_FOUND_MEMBER: 4002,
  PASSWORD_MISMATCH: 4003,
  LOGIN_FAILED: 4004,

  // 4100번대: 게시판 관련 오류
  NOT_FOUND_BOARD: 4101,
  FORBIDDEN_MODIFY_BOARD: 4102,
  FORBIDDEN_DELETE_BOARD: 4103,
  FORBIDDEN_DELETE_BOARD_COMMENT: 4104,

  // 4200번대: 추후 수정 예정
  NOT_FOUND_LECTURE: 4201,
  ALREADY_SUBSCRIBED: 4201,
  NOT_ALLOWED_SELF_SUBSCRIPTION: 4202,

  // 5000번대: 인증/인가 오류
  EXPIRED_ACCESS_TOKEN: 5001,
  EXPIRED_REFRESH_TOKEN: 5002,
  INVALID_ACCESS_TOKEN: 5003,
  INVALID_REFRESH_TOKEN: 5004,
  NOT_FOUND_REFRESH_TOKEN: 5005,
  NOT_FOUND_ACCESS_TOKEN: 5006,

  // 6000번대: 시스템 오류
  FILE_UPLOAD_ERROR: 6001,
};

/**
 * API 에러 응답 처리 함수
 * @param {object} response - API 응답 객체
 */
const handleApiError = (response: { data: { body: { message: string } } }) => {
  const { message } = response.data.body;
  alert(message);
};

export { ERROR_CODES, handleApiError };
