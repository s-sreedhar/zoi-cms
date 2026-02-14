import React from 'react'

export const CMSLogo = () => {
    return (
        <div className="cms-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
                src="/zoi.png"
                alt="Zoi Logo"
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
                Zoi
            </span>
        </div>
    )
}

export const CMSIcon = () => {
    return (
        <div className="cms-icon">
            <img
                src="/zoi.png"
                alt="Zoi Icon"
                style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                }}
            />
        </div>
    )
}
