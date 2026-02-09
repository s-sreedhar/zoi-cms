import React from 'react'

export const CMSLogo = () => {
    return (
        <div className="cms-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
                src="/zoi.png"
                alt="NUAT Labs Logo"
                style={{
                    width: 'auto',
                    height: '40px',
                    objectFit: 'contain',
                }}
            />
            <span
                style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    letterSpacing: '-0.025em',
                    color: 'var(--theme-elevation-800)',
                }}
            >
                NUAT Labs
            </span>
        </div>
    )
}

export const CMSIcon = () => {
    return (
        <div className="cms-icon">
            <img
                src="/zoi.png"
                alt="NUAT Labs Icon"
                style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                }}
            />
        </div>
    )
}
