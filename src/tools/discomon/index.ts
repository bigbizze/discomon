require('dotenv').config();

export type MonsterType = "user" | "boss";

export interface CheckLevel {
    experience: number;
    level: number;
}
