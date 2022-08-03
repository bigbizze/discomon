import { first } from "./array_helpers";
import * as mysql from 'mysql';

export const get_first_db_row = <T>(rows: T) => {
    if (Array.isArray(rows) && rows.length >= 1) {
        return first(rows);
    }
};

export const escape_string = (str: string): string => {
    const escaped = mysql.escape(str);
    return escaped.substr(1, escaped.length - 2);
};
