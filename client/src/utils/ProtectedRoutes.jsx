import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

function ProtectedRoutes() {
    console.log('ProtectedRoutes component mounted');
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            // Don't check cookie with js-cookie since it's httpOnly
            // Just try to verify with the backend - cookie will be sent automatically
            
            try {
                // Verify token with backend
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                console.log('Verifying token with backend...');
                const response = await fetch(`${API_BASE_URL}/verify`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies in the request
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                console.log('Verification response:', data);

                if (data.verified) {
                    console.log('Token is valid');
                    setUser(data.username); // Set the username if token is valid
                } else {
                    // Token is invalid, redirect to login
                    console.log('Token is invalid');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Token verification error:', error);
                // On error, redirect to login
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [navigate]);

    // Show loading state while verifying
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.2rem',
                color: '#6A7BFE'
            }}>
                Verifying...
            </div>
        );
    }

    return user ? <Outlet /> : null; // Render children routes if authenticated
}

export default ProtectedRoutes;