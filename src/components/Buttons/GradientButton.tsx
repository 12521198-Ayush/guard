import React from 'react';
import { Button } from 'antd';

interface GradientButtonProps {
    text: string;
    gradientColors?: string[]; // Accepts an array of color strings for the gradient
    disabled?: boolean;
    onClick?: () => void;
    htmlType?: 'button' | 'submit' | 'reset';
}

const GradientButton: React.FC<GradientButtonProps> = ({
    text,
    gradientColors = ['#4e92ff', '#1e62d0'], // Default blue gradient
    disabled = false,
    onClick,
    htmlType = 'button',
}) => {
    return (
        <Button
            style={{
                borderRadius: '4px',
                background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                color: 'white',
                fontWeight: 'Normal',
                padding: '5px 12px',
                border: 'none',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
            }}
            disabled={disabled}
            onClick={onClick}
            htmlType={htmlType}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
            }}
        >
            {text}
        </Button>
    );
};

export default GradientButton;
