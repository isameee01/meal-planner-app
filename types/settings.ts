export type PriceLimit = "none" | "low" | "medium" | "high";
export type CarbsType = "total" | "net";
export type GeneratorFocus = "balanced" | "variety" | "macros" | "groceries";
export type DayOfWeek = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
export type UnitSystem = "us" | "metric";
export type EnergyUnit = "kcal" | "kJ";

export interface GeneratorSettings {
    autoPlanner: boolean;
    priceLimit: PriceLimit;
    carbsType: CarbsType;
    focus: GeneratorFocus;
    allowHalfServings: boolean;
    firstDayOfWeek: DayOfWeek;
    timezone: string;
    units: UnitSystem;
    energyUnit: EnergyUnit;
}

export const DEFAULT_GENERATOR_SETTINGS: GeneratorSettings = {
    autoPlanner: true,
    priceLimit: "none",
    carbsType: "total",
    focus: "balanced",
    allowHalfServings: true,
    firstDayOfWeek: "sunday",
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
    units: "metric",
    energyUnit: "kcal"
};
