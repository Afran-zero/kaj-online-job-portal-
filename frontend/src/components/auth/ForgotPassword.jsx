import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setLoading } from '@/redux/authSlice';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { loading } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const response = await axios.post(
                `${USER_API_END_POINT}/forgot-password`,
                { email },
                { withCredentials: true }
            );
            toast.success(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={handleSubmit} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Forgot Password</h1>
                    <div className='my-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            type='email'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='patel@gmail.com'
                            required
                        />
                    </div>
                    {loading ? (
                        <Button className='w-full my-4'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                        </Button>
                    ) : (
                        <Button type='submit' className='w-full my-4'>
                            Send Reset Link
                        </Button>
                    )}
                    <span className='text-sm'>
                        Back to{' '}
                        <Link to='/login' className='text-blue-600'>
                            Login
                        </Link>
                    </span>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;