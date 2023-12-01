const { DateTime, Info } = require("luxon");


const MONTHS = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
};

const _isMonth = (month) => {
  const now = DateTime.now().plus({
    hours: 3,
  });

  const { month: currentMonth } = now;
  return currentMonth === month;
};

const isJanuary = () => _isMonth(MONTHS.JANUARY);
const isFebruary = () => _isMonth(MONTHS.FEBRUARY);
const isMarch = () => _isMonth(MONTHS.MARCH);
const isApril = () => _isMonth(MONTHS.APRIL);
const isMay = () => _isMonth(MONTHS.MAY);
const isJune = () => _isMonth(MONTHS.JUNE);
const isJuly = () => _isMonth(MONTHS.JULY);
const isAugust = () => _isMonth(MONTHS.AUGUST);
const isSeptember = () => _isMonth(MONTHS.SEPTEMBER);
const isOctober = () => _isMonth(MONTHS.OCTOBER);
const isNovember = () => _isMonth(MONTHS.NOVEMBER);
const isDecember = () => _isMonth(MONTHS.DECEMBER);



module.exports = {
  isJanuary,
  isFebruary,
  isMarch,
  isApril,
  isMay,
  isJune,
  isJuly,
  isAugust,
  isSeptember,
  isOctober,
  isNovember,
  isDecember,
};
