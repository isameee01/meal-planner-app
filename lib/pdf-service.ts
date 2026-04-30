import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserProfile } from "../types/user";
import { GeneratedMeal } from "./meal-planner";

/**
 * CustomDailyDiet PREMIUM SaaS PDF ENGINE v4.0
 * 
 * STRICT RULES:
 * 1. UTF-8 Sanitization: Clean all strings of non-ASCII to prevent PDF crashes.
 * 2. Visual Hierarchy: Use bold cards, distinct colors, and clear spacing.
 * 3. Week Mode: Force exactly 7 days, even if empty.
 */

const COLORS = {
    primary:    [16, 185, 129] as [number, number, number],   // Emerald 500
    primaryDark:[5, 150, 105] as [number, number, number],    // Emerald 600
    bgLight:    [248, 250, 252] as [number, number, number],  // Slate 50
    textMain:   [15, 23, 42] as [number, number, number],     // Slate 900
    textSub:    [71, 85, 105] as [number, number, number],    // Slate 600
    textMuted:  [148, 163, 184] as [number, number, number],  // Slate 400
    white:      [255, 255, 255] as [number, number, number],
    border:     [226, 232, 240] as [number, number, number],  // Slate 200
    
    // Macro Colors
    calories:   [16, 185, 129] as [number, number, number],   // Emerald
    protein:    [59, 130, 246] as [number, number, number],   // Blue
    carbs:      [245, 158, 11] as [number, number, number],   // Amber
    fats:       [244, 63, 94] as [number, number, number],    // Rose
};

/**
 * Sanitizes strings to prevent PDF encoding failures
 */
function clean(str: string | undefined | null): string {
    if (!str) return "";
    // Remove non-printable and non-ASCII characters to prevent broken glyphs in Helvetica
    return str.replace(/[^\x20-\x7E]/g, "").trim();
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T12:00:00");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export async function generatePremiumPDF(
    profile: UserProfile,
    mealsByDate: Record<string, GeneratedMeal[]>,
    viewMode: "day" | "week",
    selectedDate: Date
) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.width;
    const PH = doc.internal.pageSize.height;
    const M = 15; // Margin
    const CW = PW - (M * 2);

    // Calculate dates for the export
    let datesToRender: string[] = [];
    if (viewMode === "day") {
        datesToRender = [selectedDate.toISOString().split("T")[0]];
    } else {
        // Find the Monday of the selected week
        const start = new Date(selectedDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        const monday = new Date(start.setDate(diff));
        
        for (let i = 0; i < 7; i++) {
            const current = new Date(monday);
            current.setDate(monday.getDate() + i);
            datesToRender.push(current.toISOString().split("T")[0]);
        }
    }

    // ──────────────────────────────────────────
    // RENDER PAGES
    // ──────────────────────────────────────────
    datesToRender.forEach((dateKey, idx) => {
        if (idx > 0) doc.addPage();
        
        let y = M;

        // --- PREMIUM HEADER ---
        doc.setFillColor(...COLORS.primary);
        doc.rect(0, 0, PW, 40, "F");
        
        // Brand Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...COLORS.white);
        doc.text("CustomDailyDiet", M, 18);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("PREMIUM NUTRITION REPORT", M, 24);

        // User Info (Right Aligned)
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(clean(profile.fullName || "Elite Performance User"), PW - M, 18, { align: "right" });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const goalLabel = `GOAL: ${clean(profile.goalType || "Maintain").toUpperCase()}  |  TARGET: ${profile.calorieTarget} KCAL`;
        doc.text(goalLabel, PW - M, 24, { align: "right" });

        // Date Banner
        y = 48;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.textMain);
        doc.text(formatDate(dateKey), M, y);
        
        if (viewMode === "week") {
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.primary);
            doc.text(`WEEKLY VIEW | DAY ${idx + 1} OF 7`, PW - M, y, { align: "right" });
        }
        
        y += 8;

        // --- SUMMARY MACRO CARDS ---
        const dayMeals = mealsByDate[dateKey] || [];
        const totals = dayMeals.reduce((acc, m) => ({
            calories: acc.calories + m.totalCalories,
            protein: acc.protein + m.totalProtein,
            carbs: acc.carbs + m.totalCarbs,
            fat: acc.fat + m.totalFat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        y = drawSaaSSummaryCards(doc, y, totals, M, CW);
        y += 12;

        // --- MEAL SECTIONS ---
        if (dayMeals.length === 0) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.textMuted);
            doc.text("No meals planned for this date.", PW / 2, y + 20, { align: "center" });
        } else {
            dayMeals.forEach((meal) => {
                // Page break check
                if (y > PH - 40) {
                    drawFooter(doc, PW, PH, M);
                    doc.addPage();
                    y = M + 10;
                }
                y = drawMealCardPremium(doc, meal, y, M, CW, PW);
                y += 8;
            });
        }

        drawFooter(doc, PW, PH, M);
    });

    // Save File
    const dateStr = selectedDate.toISOString().split("T")[0];
    const filename = viewMode === "week" 
        ? `CustomDailyDiet_Weekly_Plan_${dateStr}.pdf` 
        : `CustomDailyDiet_Daily_Plan_${dateStr}.pdf`;
    doc.save(filename);
}

/**
 * Draws Metric Cards with Rounded Rects and Colors
 */
function drawSaaSSummaryCards(
    doc: jsPDF, y: number, 
    totals: { calories: number; protein: number; carbs: number; fat: number },
    M: number, CW: number
): number {
    const cardW = (CW - 9) / 4; // 4 cards with 3mm gaps
    const cardH = 22;
    const gap = 3;

    const cards = [
        { label: "CALORIES", value: Math.round(totals.calories), unit: "kcal", color: COLORS.calories },
        { label: "PROTEIN",  value: Math.round(totals.protein),  unit: "g",    color: COLORS.protein },
        { label: "CARBS",    value: Math.round(totals.carbs),    unit: "g",    color: COLORS.carbs },
        { label: "FATS",     value: Math.round(totals.fat),      unit: "g",    color: COLORS.fats },
    ];

    cards.forEach((card, i) => {
        const x = M + (i * (cardW + gap));
        
        // Background
        doc.setFillColor(...COLORS.bgLight);
        doc.setDrawColor(...COLORS.border);
        doc.roundedRect(x, y, cardW, cardH, 3, 3, "FD");
        
        // Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.textSub);
        doc.text(card.label, x + 4, y + 7);
        
        // Value
        doc.setFontSize(14);
        doc.setTextColor(...card.color);
        doc.text(String(card.value), x + 4, y + 17);
        
        // Unit
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.textMuted);
        const valW = doc.getTextWidth(String(card.value));
        doc.text(card.unit, x + 4 + valW + 1, y + 17);
    });

    return y + cardH;
}

/**
 * Draws a Premium Meal Card with distinct header and item list
 */
function drawMealCardPremium(
    doc: jsPDF, meal: GeneratedMeal, 
    y: number, M: number, CW: number, PW: number
): number {
    const headerH = 10;
    
    // Header Bar
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(M, y, CW, headerH, 2, 2, "F");
    
    // Icon + Name
    const icon = meal.slot === "Breakfast" ? "[B]" : meal.slot === "Lunch" ? "[L]" : meal.slot === "Dinner" ? "[D]" : "[S]";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text(`${icon} ${meal.slot.toUpperCase()}`, M + 4, y + 6.5);
    
    // Meal Macros on Right
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const macroStr = `${meal.totalCalories} kcal  |  P: ${meal.totalProtein}g  C: ${meal.totalCarbs}g  F: ${meal.totalFat}g`;
    doc.text(macroStr, PW - M - 4, y + 6.5, { align: "right" });
    
    y += headerH + 4;

    // Items Table
    if (meal.items.length > 0) {
        autoTable(doc, {
            startY: y,
            margin: { left: M + 2, right: M + 2 },
            head: [["Food Item", "Serving", "Cals", "P", "C", "F"]],
            body: meal.items.map(item => [
                clean(item.food.name),
                clean(`${item.amount}x ${item.food.serving}`),
                Math.round(item.food.calories! * item.amount),
                Math.round(item.food.protein! * item.amount),
                Math.round(item.food.carbs! * item.amount),
                Math.round(item.food.fat! * item.amount),
            ]),
            theme: "plain",
            styles: { fontSize: 8, cellPadding: 1.5, textColor: COLORS.textMain },
            headStyles: { fontStyle: "bold", textColor: COLORS.textSub, borderBottomColor: COLORS.border, lineWidth: { bottom: 0.1 } },
            columnStyles: { 0: { fontStyle: "bold" }, 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" }, 5: { halign: "center" } }
        });
        y = (doc as any).lastAutoTable.finalY + 4;
    }

    // Ingredients List (Clean List Format)
    const ingredients = meal.items.flatMap(i => i.food.ingredients || []);
    if (ingredients.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.textMuted);
        doc.text("INGREDIENTS:", M + 4, y);
        y += 4;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.textSub);
        
        ingredients.forEach(ing => {
            const text = `- ${clean(ing.name)} (${clean(ing.amount)})`;
            doc.text(text, M + 6, y);
            y += 3.5;
        });
    }

    return y + 2;
}

function drawFooter(doc: jsPDF, PW: number, PH: number, M: number) {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.1);
    doc.line(M, PH - 15, PW - M, PH - 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Report generated by CustomDailyDiet AI Engine. Professional Nutrition Planning.", PW / 2, PH - 10, { align: "center" });
    
    const pageCount = doc.getNumberOfPages();
    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, PW - M, PH - 10, { align: "right" });
}
