import format from 'date-fns/format';

export function date_string(s_format = 'd/T @ HH:mm') {
    return format(new Date(), s_format);
}

export function dex_date(date: number) {
    return format(new Date(date), 'MMM-d-yyyy');
}

/**
 * @param date {Date} [Date.now() = default] Takes in a Javascript Date object and converts it into the string
 *                                            format required by mysql's DateTime field type.
 */
export function date_to_mysql(date?: Date) {
    const _date = date == null ? new Date(Date.now()) : date;
    return _date.getFullYear() + '-' +
        ('00' + (_date.getMonth() + 1)).slice(-2) + '-' +
        ('00' + _date.getDate()).slice(-2) + ' ' +
        ('00' + _date.getHours()).slice(-2) + ':' +
        ('00' + _date.getMinutes()).slice(-2) + ':' +
        ('00' + _date.getSeconds()).slice(-2);
}
