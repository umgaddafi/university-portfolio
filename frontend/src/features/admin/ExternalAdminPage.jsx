import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export function ExternalAdminPage() {
    const { system } = useParams();

    const systems = {
        'audit-admin': { url: 'http://localhost:5174/admin', title: 'Audit System Admin' },
        'appraisal-admin': { url: 'http://localhost:5175/login', title: 'Appraisal System Admin' },
        'appraisal-supervisor': { url: 'http://localhost:5175/login', title: 'Appraisal Supervisor' },
        'appraisal-dept-chairman': { url: 'http://localhost:5175/login', title: 'Appraisal Dept Chairman' },
        'appraisal-apc': { url: 'http://localhost:5175/login', title: 'Appraisal A&P Chairman' },
    };

    const currentSystem = systems[system];

    if (!currentSystem) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <iframe
                src={currentSystem.url}
                title={currentSystem.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="fullscreen"
            />
        </div>
    );
}
