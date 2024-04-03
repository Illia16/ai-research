import React from "react";

const EmailInput = () => {
    return (
        <div className="email-input">
            <label htmlFor="email" className="email-label">
                EMAIL ADDRESS
            </label>
            <input
                type="email"
                id="email"
                name="email"
                className="email-field"
                placeholder="Your email address"
                required
            />
        </div>
    );
};

export default EmailInput;
