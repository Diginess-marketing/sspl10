
import FAQSection from "@/components/FAQSection";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const FAQPage = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Helmet>
                <title>Frequently Asked Questions | SSPL T10</title>
                <meta name="description" content="Find answers to common questions about SSPL T10 League registration, trials, eligibility, fees, and more." />
            </Helmet>

            <main className="min-h-screen bg-gray-50">
                <FAQSection />
            </main>
        </>
    );
};

export default FAQPage;
