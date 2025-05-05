import { setAllJobs } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery, user } = useSelector((store) => store.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            if (!user) return; // Skip if not logged in
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`, {
                    withCredentials: true,
                });
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log('Fetch jobs error:', error);
                toast.error(error.response?.data?.message || 'Failed to fetch jobs');
            }
        };
        fetchAllJobs();
    }, [dispatch, searchedQuery, user]);
};

export default useGetAllJobs;