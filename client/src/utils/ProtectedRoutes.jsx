import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function ProtectedRoutes() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = Cookies.get('token'); // Get the token from cookies
            console.log('Token from cookies:', token);
            if (!token) {
                navigate('/login'); // Redirect to the login page if no token
                setLoading(false);
                return;
            }

            try {
                // Verify token with backend
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${API_BASE_URL}/verify`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies in the request
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.verified) {
                    console.log('Token is valid');
                    setUser(data.username); // Set the username if token is valid
                } else {
                    // Token is invalid, clear cookie and redirect to login
                    Cookies.remove('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Token verification error:', error);
                // On error, redirect to login
                Cookies.remove('token');
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