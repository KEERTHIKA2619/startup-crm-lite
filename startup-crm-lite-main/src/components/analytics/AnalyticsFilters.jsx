export default function AnalyticsFilters({ filterType, setFilterType, customRange, setCustomRange }) {
  const options = [
    { label: 'Last 7 Days', value: '7_days' },
    { label: 'Last 30 Days', value: '30_days' },
    { label: 'Last 90 Days', value: '90_days' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Custom Range', value: 'custom' }
  ];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setCustomRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-bg-surface border border-border-base shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {options.map((opt) => {
          const isActive = filterType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`h-9 px-4 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20 scale-[1.01]'
                  : 'bg-bg-surface border-border-base text-text-muted hover:text-text-main hover:border-border-base/80 hover:bg-bg-surface-hover'
              }`}
            >
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {filterType === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-xs text-text-muted font-medium">Start Date:</label>
            <input
              id="start-date"
              type="date"
              name="startDate"
              value={customRange.startDate || ''}
              onChange={handleDateChange}
              className="h-9 px-3 rounded-lg bg-bg-base border border-border-base text-xs text-text-main focus:outline-none focus:border-primary/50 transition-colors cursor-text"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-xs text-text-muted font-medium">End Date:</label>
            <input
              id="end-date"
              type="date"
              name="endDate"
              value={customRange.endDate || ''}
              onChange={handleDateChange}
              className="h-9 px-3 rounded-lg bg-bg-base border border-border-base text-xs text-text-main focus:outline-none focus:border-primary/50 transition-colors cursor-text"
            />
          </div>
        </div>
      )}
    </div>
  );
}
