import { sample } from 'underscore';
import { BadRequestException } from '@nestjs/common';
import { IUser } from '../models';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { getConfig } from '../config';
import { moment } from './moment-extend';
import { ALPHA_NUMERIC_CODE_LENGTH } from '../common';

namespace Utils {
  export function generatedLogoColor() {
    return sample(['#269aff', '#ffaf26', '#8b72ff', '#0ecc9D']).replace(
      '#',
      '',
    );
  }
}

export const getDummyImage = (
  width: number,
  height: number,
  letter: string,
) => {
  return `https://dummyimage.com/${width}x${height}/${Utils.generatedLogoColor()}/ffffff.jpg&text=${letter}`;
};

export const getUserDummyImage = (user: IUser) => {
  const firstNameLetter = user.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : '';
  if (firstNameLetter) {
    return getDummyImage(330, 300, firstNameLetter);
  } else {
    const firstEmailLetter = user.email.charAt(0).toUpperCase();
    return getDummyImage(330, 300, firstEmailLetter);
  }
};

export function reflect(promise) {
  return promise.then(
    (item) => ({ item, status: 'fulfilled' }),
    (error) => ({ error, status: 'rejected' }),
  );
}

/**
 * To calculate the last day of a month, we need to set date=0 and month as the next month.
 * So, if we want the last day of February (February is month = 1) we'll need to perform 'new Date(year, 2, 0).getDate()'
 */
export function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function arrayToObject(array, key, value) {
  return array.reduce((prev, current) => {
    return {
      ...prev,
      [current[key]]: current[value],
    };
  }, {});
}

/*
 * To convert unix timestamp to datetime using date format
 */
export function unixTimestampToDate(
  timestamps,
  format = 'YYYY-MM-DD HH:mm:ss',
) {
  const millisecond = 1000;
  return moment.unix(timestamps / millisecond).format(format);
}

/*
 * To convert any datetime to any datetime format
 */
export function convertToDatetime(datetime) {
  if (moment(new Date(datetime)).isValid()) {
    const dbType = getConfig().dbConnectionOptions.type || 'sqlite';
    const allowedDbTypes = ['sqlite', 'better-sqlite3'];
    if (allowedDbTypes.includes(dbType)) {
      return moment(new Date(datetime)).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return moment(new Date(datetime)).toDate();
    }
  }
  return null;
}

export async function tempFile(prefix) {
  const tempPath = path.join(os.tmpdir(), prefix);
  const folder = await fs.promises.mkdtemp(tempPath);
  return path.join(folder, prefix + moment().unix() + Math.random() * 10000);
}

/*
 * Get date range according for different unitOfTimes
 */
export function getDateRange(
  startDate?: string | Date,
  endDate?: string | Date,
  type: 'day' | 'week' = 'day',
  isFormat: boolean = false,
) {
  if (endDate === 'day' || endDate === 'week') {
    type = endDate;
  }

  let start: any = moment.utc().startOf(type);
  let end: any = moment.utc().endOf(type);

  if (startDate && endDate !== 'day' && endDate !== 'week') {
    start = moment.utc(startDate).startOf(type);
    end = moment.utc(endDate).endOf(type);
  } else {
    if (
      (startDate && endDate === 'day') ||
      endDate === 'week' ||
      (startDate && !endDate)
    ) {
      start = moment.utc(startDate).startOf(type);
      end = moment.utc(startDate).endOf(type);
    }
  }

  if (!start.isValid() || !end.isValid()) {
    return;
  }

  if (end.isBefore(start)) {
    throw 'End date must be greater than start date.';
  }

  const dbType = getConfig().dbConnectionOptions.type || 'sqlite';
  if (['sqlite', 'better-sqlite3'].includes(dbType)) {
    start = start.format('YYYY-MM-DD HH:mm:ss');
    end = end.format('YYYY-MM-DD HH:mm:ss');
  } else {
    if (!isFormat) {
      start = start.toDate();
      end = end.toDate();
    } else {
      start = start.format();
      end = end.format();
    }
  }

  return {
    start,
    end,
  };
}

export const getOrganizationDummyImage = (name: string) => {
  const firstNameLetter = name ? name.charAt(0).toUpperCase() : '';
  return getDummyImage(330, 300, firstNameLetter);
};

export const getTenantLogo = (name: string) => {
  const firstNameLetter = name ? name.charAt(0).toUpperCase() : '';
  return getDummyImage(330, 300, firstNameLetter);
};

/**
 * GET Date Range Format
 *
 * @param startDate
 * @param endDate
 * @returns
 */
export function getDateRangeFormat(
  startDate: moment.Moment,
  endDate: moment.Moment,
): {
  start: string | Date;
  end: string | Date;
} {
  const start = moment(startDate);
  const end = moment(endDate);

  if (!start.isValid() || !end.isValid()) {
    return;
  }
  if (end.isBefore(start)) {
    throw 'End date must be greater than start date.';
  }

  const dbType = getConfig().dbConnectionOptions.type || 'sqlite';
  const allowedDbTypes = ['sqlite', 'better-sqlite3'];
  if (allowedDbTypes.includes(dbType)) {
    return {
      start: start.format('YYYY-MM-DD HH:mm:ss'),
      end: end.format('YYYY-MM-DD HH:mm:ss'),
    };
  } else {
    return {
      start: start.toDate(),
      end: end.toDate(),
    };
  }
}

/**
 * Get All Dates Between Two Dates in Moment JS
 *
 * @param startDate
 * @param endDate
 * @returns
 */
export function getDaysBetweenDates(
  startDate: string | Date,
  endDate: string | Date,
): string[] {
  const start = moment(moment(startDate).format('YYYY-MM-DD')).add(1, 'day');
  const end = moment(moment(endDate).format('YYYY-MM-DD'));
  const range = Array.from(moment.range(start, end).by('day'));

  const days: Array<string> = [];
  let i = 0;
  while (i < range.length) {
    const date = range[i].format('YYYY-MM-DD');
    days.push(date);
    i++;
  }

  return days;
}

/**
 * Generating a random integer number with flexible length
 *
 * @param length
 */
export function generateRandomInteger(length = 6) {
  return Math.floor(
    Math.pow(10, length - 1) +
      Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1),
  );
}

/**
 * Generate a random alphanumeric code.
 * @param length The length of the code. Default is 6.
 * @returns The generated code.
 */
export function generateRandomAlphaNumericCode(
  length: number = ALPHA_NUMERIC_CODE_LENGTH,
): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    code += characters[index];
  }

  return code;
}

/**
 * Get a fresh timestamp for the entity.
 *
 * @returns {Date}
 */
export function freshTimestamp(): Date {
  return new Date(moment.now());
}

/**
 * Function that performs the date range validation
 *
 * @param startedAt
 * @param stoppedAt
 * @returns
 */
export function validateDateRange(startedAt: Date, stoppedAt: Date): void {
  try {
    const start = moment(startedAt);
    const end = moment(stoppedAt);

    console.log('------ Stopped Timer ------', start.toDate(), end.toDate());

    if (!start.isValid() || !end.isValid()) {
      throw 'Started and Stopped date must be valid date.';
      // If either start or end date is invalid, return without throwing an exception
    }

    if (end.isBefore(start)) {
      throw 'Stopped date must be greater than started date.';
    }
  } catch (error) {
    // If any error occurs during date validation, throw a BadRequestException
    throw new BadRequestException(error);
  }
}

/**
 * Function that returns intersection of 2 array
 * @param arr1
 * @param arr2
 * @returns
 */
export function findIntersection(arr1: any[], arr2: any[]) {
  const set1 = new Set(arr1);
  const intersection = arr2.filter((element) => set1.has(element));
  return intersection;
}