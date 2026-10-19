import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, BarChart3, FileSpreadsheet, ArrowUpRight, DollarSign, ShoppingCart, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function Reports() {
  const [period, setPeriod] = useState('week'); // 'week', 'month'
  const [sales, setSales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    Promise.all([
      adminApi.getSalesReport({ period }),
      adminApi.getTopItems(),
    ])
      .then(([salesRes, topRes]) => {
        setSales(salesRes.data || []);
        setTopItems(topRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExportCSV = () => {
    if (sales.length === 0) {
      toast.error('No sales data available to export');
      return;
    }

    const headers = 'Date,Completed Orders,Gross Revenue (ETB),AOV (ETB)\n';
    const rows = sales
      .map((s) => {
        const aov = s.orderCount > 0 ? (s.revenue / s.orderCount).toFixed(2) : 0;
        return `${s.date},${s.orderCount},${s.revenue},${aov}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sami_cafe_financial_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial ledger exported to CSV!');
  };

  if (loading) return <Loader text="Generating financial statements & sales analytics..." />;

  const totalPeriodRevenue = sales.reduce((acc, s) => acc + s.revenue, 0);
  const totalPeriodOrders = sales.reduce((acc, s) => acc + s.orderCount, 0);
  const overallAOV = totalPeriodOrders > 0 ? totalPeriodRevenue / totalPeriodOrders : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-gold-600 block">
            Auditing & Financial Intelligence
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-coffee-950 mt-0.5">
            Sales & Revenue Reports
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-xs focus:outline-none"
          >
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>

          <Button
            variant="primary"
            size="md"
            onClick={handleExportCSV}
            className="gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200 space-y-1">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Gross Period Revenue</span>
          <p className="font-display font-black text-3xl text-leaf-600">
            {formatCurrency(totalPeriodRevenue)}
          </p>
          <p className="text-xs text-stone-500 pt-1">All dine-in, takeaway, and delivery receipts</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200 space-y-1">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Total Paid Orders</span>
          <p className="font-display font-black text-3xl text-coffee-950">
            {totalPeriodOrders} Orders
          </p>
          <p className="text-xs text-stone-500 pt-1">Settled invoices and cash register slips</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200 space-y-1">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Average Order Value (AOV)</span>
          <p className="font-display font-black text-3xl text-gold-700">
            {formatCurrency(overallAOV)}
          </p>
          <p className="text-xs text-stone-500 pt-1">Average guest spending per ticket</p>
        </div>
      </div>

      {/* Daily Sales Journal */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-lg text-coffee-950">
              Daily Ledger & Revenue Journal
            </h3>
            <p className="text-xs text-stone-400">Audited transaction records for the selected period</p>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
            {sales.length} days logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Completed Orders</th>
                <th className="py-4 px-5">Average Ticket Size</th>
                <th className="py-4 px-5 text-right">Daily Gross (ETB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-stone-400">
                    No sales recorded in this interval.
                  </td>
                </tr>
              ) : (
                sales.map((row, idx) => {
                  const aov = row.orderCount > 0 ? row.revenue / row.orderCount : 0;
                  return (
                    <tr key={idx} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-5 font-bold text-coffee-950 font-mono text-xs">
                        {row.date}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-stone-800">
                        {row.orderCount} orders
                      </td>
                      <td className="py-3.5 px-5 text-stone-600 font-mono">
                        {formatCurrency(aov)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-display font-black text-leaf-600 text-sm">
                        {formatCurrency(row.revenue)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
