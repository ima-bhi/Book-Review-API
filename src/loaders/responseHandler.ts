import LoggerInstance from './logger';

export default (res, statusCode, message, result, totalCount) => {
  try {
    return res.json({
      responseCode: statusCode,
      responseMessage: message || '',
      result: result,
      totalCount: totalCount,
    });
  } catch (e) {
    LoggerInstance.error('Error on response Handler loading: %o', e);
    throw e;
  }
};
