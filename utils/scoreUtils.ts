// 根据评分获取对应的颜色
export const getScoreColor = (score: number): string => {
  if (score >= 9) {
    return 'success';
  } else if (score >= 7) {
    return 'processing';
  } else if (score >= 5) {
    return 'warning';
  } else {
    return 'error';
  }
};

// 根据评分获取等级
export const getScoreLevel = (score: number): string => {
  if (score >= 9) {
    return '优秀';
  } else if (score >= 7) {
    return '良好';
  } else if (score >= 5) {
    return '一般';
  } else {
    return '待改进';
  }
};
