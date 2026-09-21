
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from '@/utils/schema-generator';

/**
 * Renders global JSON-LD schemas that should be present on every page.
 * Includes Organization and WebSite schema.
 */
const GlobalSchema = () => {
    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(ORGANIZATION_SCHEMA)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(WEBSITE_SCHEMA)}
            </script>
        </Helmet>
    );
};

export default GlobalSchema;
