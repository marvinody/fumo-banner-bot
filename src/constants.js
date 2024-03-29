const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
]

const ALLOWED_DECODERS = ALLOWED_IMAGE_TYPES.map(s => s.substring('image/'.length))

const MAX_FILE_SIZE_IN_MB = 5;

const MINIMUM_WIDTH = 960;
const MINIMUM_HEIGHT = 540;

const MAX_ENABLED_PER_USER = 5;

const CRON_TIMES = {
  EVERY_30_SECONDS: '*/30 * * * * *',
  EVERY_HOUR: '0 0 * * * *',
  EVERY_6_HOURS: '0 0 */6 * * *',
  EVERY_DAY: '0 0 0 * * *'
}

const SETTINGS = {
  CRON_TIME: 'cron-time',
  DM_PREF: 'dm-pref',
}

const DB_NAME = 'okina.db'

module.exports = {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DECODERS,
  MAX_FILE_SIZE_IN_MB,
  MINIMUM_HEIGHT,
  MINIMUM_WIDTH,
  CRON_TIMES,
  SETTINGS,
  DB_NAME,
  MAX_ENABLED_PER_USER,
}