export type WeightUnit = "kg" | "lbs";

export const KG_TO_LBS = 2.20462; // Consistent with the user's previously implied ratio or standard
// However, the user provided exact formulas:
// kg = lbs * 0.453592
// lbs = kg / 0.453592

export const LBS_TO_KG_RATIO = 0.453592;

export function convertToLbs(kg: number): number {
    return kg / LBS_TO_KG_RATIO;
}

export function convertToKg(lbs: number): number {
    return lbs * LBS_TO_KG_RATIO;
}

export interface FormattedWeight {
    primary: string;
    secondary: string;
    primaryValue: number;
    secondaryValue: number;
    unit: WeightUnit;
}

export function formatWeight(weightKg: number, unit: WeightUnit): FormattedWeight {
    if (!weightKg || weightKg === 0) {
        return {
            primary: "— " + unit,
            secondary: unit === "kg" ? "— lbs" : "— kg",
            primaryValue: 0,
            secondaryValue: 0,
            unit
        };
    }

    if (unit === "kg") {
        const primaryValue = Number(weightKg.toFixed(1));
        const secondaryValue = Math.round(convertToLbs(weightKg));
        return {
            primary: `${primaryValue} kg`,
            secondary: `${secondaryValue} lbs`,
            primaryValue,
            secondaryValue,
            unit
        };
    } else {
        const primaryValue = Math.round(convertToLbs(weightKg));
        const secondaryValue = Number(weightKg.toFixed(1));
        return {
            primary: `${primaryValue} lbs`,
            secondary: `${secondaryValue} kg`,
            primaryValue,
            secondaryValue,
            unit
        };
    }
}
