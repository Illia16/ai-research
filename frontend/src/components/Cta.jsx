import React from 'react';

const EfficacyButton = () => {
    const handleClick = () => {
        // Add logic for button click action here (e.g., navigate to efficacy data)
    };

    return (
        <button
            className='cta-btn'
            style={{ backgroundColor: '#0072c6', color: '#fff' }}
            onClick={handleClick}
        >
            <span className='cta-text'>Efficacy Data</span>
            <svg
                viewBox='0 0 10.6 8'
                fill='#fff'
                xmlns='http://www.w3.org/2000/svg'
                style={{ marginLeft: '10px' }}
            >
                <path d='M9.302.244l1.06 1.06-5.6 5.6L.8 1.304 1.862.244 5.462 3.8l3.84-3.84' />
            </svg>
        </button>
    );
};

export default EfficacyButton;
