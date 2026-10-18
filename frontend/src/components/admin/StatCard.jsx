const StatCard = ({ label, value, icon: Icon, accent = '#8B5CF6' }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-xs transition flex items-center gap-3.5 flex-1 min-w-[170px]">
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
      style={{ backgroundColor: `${accent}18`, color: accent }}
    >
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-black text-slate-900 leading-tight truncate">{value}</p>
      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{label}</p>
    </div>
  </div>
);

export default StatCard;
