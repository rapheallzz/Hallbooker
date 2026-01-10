'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';
import { BarChart as BarChartIcon, Eye, Briefcase, TrendingUp, Target, CalendarCheck, Calendar as CalendarIcon, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format as formatDate } from 'date-fns';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

// (Keep all the previously defined types)
interface OverallStats {
  totalRevenue: number;
  totalViews: number;
  totalDemoBookings: number;
  totalBookings: {
    confirmed: number;
    cancelled: number;
    pending: number;
  };
}

interface RevenueBreakdown {
  totalRevenue: number;
  hallRevenue: number;
  facilityRevenue: number;
  hallId: string;
  hallName: string;
}

interface Booking {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  walkInUserDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
  hall: {
    _id: string;
    name: string;
  };
  eventDetails: string;
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  totalPrice: number;
  paymentStatus: string;
  status: string;
  bookingType: string;
}

interface KPIs {
  bookingConversionRate: string;
  averageBookingValue: string;
  busiestDays: {
    day: string;
    count: number;
  }[];
}

interface AnalyticsData {
  overallStats: OverallStats;
  revenueDetails: {
    breakdownByHall: RevenueBreakdown[];
  };
  recentBookings: {
    bookings: Booking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBookings: number;
    };
  };
  kpis: KPIs;
}
interface Hall {
  _id: string;
  name: string;
}


const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105">
    <div className="bg-gray-100 p-3 rounded-full"><Icon className="h-6 w-6 text-gray-600" /></div>
    <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div>
  </div>
);

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle); const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos; const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos; const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22; const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">{payload.hallName}</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`Revenue ${formatCurrency(value)}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">{`( ${(percent * 100).toFixed(2)}% )`}</text>
        </g>
    );
};
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);


const EnhancedAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([{ startDate: new Date(new Date().setDate(new Date().getDate() - 7)), endDate: new Date(), key: 'selection' }]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHallPicker, setShowHallPicker] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const datePickerRef = useRef(null);
  const hallPickerRef = useRef(null);

  useOnClickOutside(datePickerRef, () => setShowDatePicker(false));
  useOnClickOutside(hallPickerRef, () => setShowHallPicker(false));

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  const fetchAnalytics = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: formatDate(dateRange[0].startDate, 'yyyy-MM-dd'),
        endDate: formatDate(dateRange[0].endDate, 'yyyy-MM-dd'),
        page: page.toString(),
        limit: '10'
      });
      if (selectedHall) params.append('hallId', selectedHall._id);

      const response = await api.get(`../v2/analytics/hall-owner?${params.toString()}`);
      if (response.data?.success) setData(response.data.data);
      else throw new Error(response.data.message || 'Failed to fetch');
    } catch (err: any) {
      console.error(err);
      setData({ overallStats: { totalRevenue: 0, totalViews: 0, totalDemoBookings: 0, totalBookings: { confirmed: 0, cancelled: 0, pending: 0 } }, revenueDetails: { breakdownByHall: [] }, recentBookings: { bookings: [], pagination: { currentPage: 1, totalPages: 1, totalBookings: 0 } }, kpis: { bookingConversionRate: '0.00', averageBookingValue: '0.00', busiestDays: [] } });
    } finally { setLoading(false); }
  }, [dateRange, selectedHall]);

  useEffect(() => {
    fetchAnalytics(currentPage);
  }, [fetchAnalytics, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, selectedHall]);

  useEffect(() => {
    api.get('/halls/by-owner').then(res => res.data?.success && setHalls(res.data.data)).catch(err => console.error("Failed to fetch halls", err));
  }, []);

  const handleClearFilters = () => {
    setSelectedHall(null);
    setDateRange([{ startDate: new Date(new Date().setDate(new Date().getDate() - 7)), endDate: new Date(), key: 'selection' }]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const analyticsData = data || { overallStats: { totalRevenue: 0, totalViews: 0, totalDemoBookings: 0, totalBookings: { confirmed: 0, cancelled: 0, pending: 0 } }, revenueDetails: { breakdownByHall: [] }, recentBookings: { bookings: [], pagination: { currentPage: 1, totalPages: 1, totalBookings: 0 } }, kpis: { bookingConversionRate: '0.00', averageBookingValue: '0.00', busiestDays: [] } };
  const { overallStats, kpis, revenueDetails, recentBookings } = analyticsData;

  const COLORS = ['#295FA7', '#B68945', '#4A90E2', '#D0021B', '#F5A623'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
        <div><h1 className="text-3xl font-bold text-gray-800">Dashboard</h1><p className="text-gray-500">An overview of your business performance.</p></div>
        <div className="p-4 bg-white rounded-lg shadow-md flex flex-wrap items-center gap-4">
            <div className="relative flex-grow md:flex-grow-0" ref={datePickerRef}><button onClick={() => setShowDatePicker(d => !d)} className="w-full md:w-64 border rounded-md p-2 flex items-center justify-between"><CalendarIcon className="h-5 w-5 mr-2 text-gray-500"/><span>{`${formatDate(dateRange[0].startDate, "MMM d, yyyy")} - ${formatDate(dateRange[0].endDate, "MMM d, yyyy")}`}</span><ChevronDown className="h-5 w-5 text-gray-500"/></button>{showDatePicker && (<div className="absolute top-full mt-2 z-10"><DateRange editableDateInputs={true} onChange={item => setDateRange([item.selection])} moveRangeOnFirstSelection={false} ranges={dateRange} /></div>)}</div>
            <div className="relative flex-grow md:flex-grow-0" ref={hallPickerRef}><button onClick={() => setShowHallPicker(d => !d)} className="w-full md:w-64 border rounded-md p-2 flex items-center justify-between"><Search className="h-5 w-5 mr-2 text-gray-500"/><span>{selectedHall ? selectedHall.name : 'All Halls'}</span><ChevronDown className="h-5 w-5 text-gray-500"/></button>{showHallPicker && (<div className="absolute top-full mt-2 z-10 bg-white border rounded-md shadow-lg w-full md:w-64"><div className="p-2 border-b"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md"/></div><ul className="max-h-60 overflow-y-auto">{halls.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase())).map(hall => (<li key={hall._id} onClick={() => { setSelectedHall(hall); setShowHallPicker(false); }} className="p-2 hover:bg-gray-100 cursor-pointer">{hall.name}</li>))}</ul></div>)}</div>
            <button onClick={handleClearFilters} className="text-sm text-gray-600 hover:text-gray-800 ml-auto">Clear Filters</button>
        </div>

        {loading ? ( <div className="animate-pulse space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{[...Array(6)].map((_, i) => ( <div key={i} className="bg-gray-200 p-6 rounded-lg shadow-md h-24"></div> ))}</div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-gray-200 rounded-lg shadow-md h-96"></div><div className="bg-gray-200 rounded-lg shadow-md h-96"></div></div><div className="bg-gray-200 rounded-lg shadow-md h-96"></div></div>)
        : ( <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(overallStats.totalRevenue)} icon={BarChartIcon} /> <StatCard title="Total Hall Views" value={overallStats.totalViews} icon={Eye} /> <StatCard title="Confirmed Bookings" value={overallStats.totalBookings.confirmed} icon={Briefcase} /> <StatCard title="Booking Conversion" value={`${kpis.bookingConversionRate}%`} icon={Target} /> <StatCard title="Avg. Booking Value" value={formatCurrency(Number(kpis.averageBookingValue))} icon={TrendingUp} /> <StatCard title="Demo Bookings" value={overallStats.totalDemoBookings} icon={CalendarCheck} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Busiest Days</h2>
                    {kpis.busiestDays && kpis.busiestDays.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={kpis.busiestDays}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#295FA7" name="Bookings" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">No data available for this period.</div>
                    )}
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue by Hall</h2>
                    {revenueDetails.breakdownByHall && revenueDetails.breakdownByHall.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={revenueDetails.breakdownByHall} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#295FA7" dataKey="totalRevenue" onMouseEnter={onPieEnter}>
                                    {revenueDetails.breakdownByHall.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">No data available for this period.</div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead><tr className="bg-gray-50"><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">User</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th><th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentBookings.bookings.map((booking) => (<tr key={booking._id}><td className="p-3 whitespace-nowrap"><div className="font-medium text-gray-900">{booking.user?.fullName || booking.walkInUserDetails?.fullName || 'N/A'}</div><div className="text-sm text-gray-500">{booking.user?.email || booking.walkInUserDetails?.email || ''}</div></td><td className="p-3 whitespace-nowrap text-sm text-gray-800">{booking.eventDetails}</td><td className="p-3 whitespace-nowrap text-sm text-gray-600">{formatDate(new Date(booking.bookingDates[0].startTime), 'MMM d, yyyy')}</td><td className="p-3 whitespace-nowrap text-sm font-semibold text-gray-800">{formatCurrency(booking.totalPrice)}</td><td className="p-3 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{booking.status}</span></td></tr>))}
                            {recentBookings.bookings.length === 0 && (<tr><td colSpan={5} className="text-center py-10 text-gray-500">No bookings found for this period.</td></tr>)}
                        </tbody>
                    </table>
                </div>
                {recentBookings.pagination.totalPages > 1 && (<div className="flex justify-between items-center mt-4"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded-md disabled:opacity-50"><ChevronLeft/></button><span>Page {currentPage} of {recentBookings.pagination.totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(recentBookings.pagination.totalPages, p + 1))} disabled={currentPage === recentBookings.pagination.totalPages} className="p-2 border rounded-md disabled:opacity-50"><ChevronRight/></button></div>)}
            </div>
        </>)}
    </div>
  );
};

export default EnhancedAnalytics;
