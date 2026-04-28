"use client";

import { useEffect } from "react";
import { testDB } from "@/lib/db-test";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MealGenerator from "../components/MealGenerator";
import SupportedDiets from "../components/SupportedDiets";
import Calculators from "../components/Calculators";

export default function Home() {

    useEffect(() => {
        testDB();
    }, []);

    return (
        <main className="min-h-screen">
            <Navbar />
            <Hero />
            <MealGenerator />
            <SupportedDiets />
            <Calculators />
        </main>
    );
}