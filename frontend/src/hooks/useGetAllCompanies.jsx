import { setCompanies } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.auth);

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!user) {
                console.log('Skipping company fetch: User not authenticated');
                return;
            }
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get`, {
                    withCredentials: true,
                });
                if (res.data.success) {
                    dispatch(setCompanies(res.data.companies));
                }
            } catch (error) {
                console.log('Fetch companies error:', error);
                toast.error(error.response?.data?.message || 'Failed to fetch companies');
            }
        };
        fetchCompanies();
    }, [dispatch, user]);
};

export default useGetAllCompanies;