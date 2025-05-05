import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import Navbar from '../shared/Navbar';

const VerifyEmail = () => {
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = new URLSearchParams(location.search).get('token');
            try {
                const response = await axios.get(`${USER_API_END_POINT}/verify-email?token=${token}`, {
                    withCredentials: true,
                });
                setMessage(response.data.message);
                toast.success(response.data.message);
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Verification failed';
                setMessage(errorMessage);
                toast.error(errorMessage);
            }
        };
        verifyEmail();
    }, [location, navigate]);

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <div className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Email Verification</h1>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;