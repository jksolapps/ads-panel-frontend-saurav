import React from 'react';

// Lighter, pastel color palette for heatmap
const getRetentionColor = (percent) => {
   if (percent === null || percent === undefined || percent === '') return '#f4f4f4';
   const value = parseFloat(percent);
   if (isNaN(value)) return '#f4f4f4';
   if (value >= 15) return '#b8f2d0'; // Light green
   if (value >= 10) return '#ffe9a7'; // Light yellow
   if (value >= 7) return '#ffd6a5'; // Light orange
   if (value >= 4) return '#ffb3b3'; // Light orange-red
   return '#ffd6e0'; // Light red
};

const AllInOneRetentionOverview = ({ data }) => {

   // Prepare heatmap data
   const installDates = data.map(item => item.installDate);
   const maxDays = 14;
   const dayKeys = Array.from({ length: maxDays }, (_, i) => `day${i + 1}`);

   return (
      <div className="retention-overview-container">
         <div className="retention-overview-title">Retention Overview</div>
         <div className="retention-heatmap-section">
            <div className="retention-heatmap-table-wrapper" style={{ overflowX: 'auto' }}>
               <table className="retention-heatmap-table" style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 700 }}>
                  <thead>
                     <tr>
                        <th style={{ background: '#f7fafd', position: 'sticky', fontWeight: 500, left: 0, zIndex: 2 }}>Day</th>
                        {installDates.map(date => (
                           <th key={date} style={{ fontWeight: 500 }}>{date}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {dayKeys.map((dayKey, i) => (
                        <tr key={dayKey}>
                           <td style={{ background: '#f7fafd', fontWeight: 500, color: "#3c4043", position: 'sticky', textAlign: 'center', left: 0, zIndex: 1 }}>{`Day ${i + 1}`}</td>
                           {data.map((item, colIdx) => {
                              const percent = item[dayKey]?.percent || '';
                              const color = percent ? getRetentionColor(percent) : '#f4f4f4';
                              return (
                                 <td key={colIdx} style={{ background: color, color: '#3c4043', fontWeight: 500, minWidth: 70, textAlign: 'center', borderRadius: 8, border: '2px solid #f7fafd', position: 'relative' }}>
                                    {percent ? `${percent}` : '-'}
                                 </td>
                              );
                           })}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="retention-heatmap-legend" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
               <span style={{ fontSize: 13, color: '#888' }}>Low</span>
               <span style={{ width: 28, height: 16, background: '#ffd6e0', borderRadius: 4, display: 'inline-block' }}></span>
               <span style={{ width: 28, height: 16, background: '#ffb3b3', borderRadius: 4, display: 'inline-block' }}></span>
               <span style={{ width: 28, height: 16, background: '#ffd6a5', borderRadius: 4, display: 'inline-block' }}></span>
               <span style={{ width: 28, height: 16, background: '#ffe9a7', borderRadius: 4, display: 'inline-block' }}></span>
               <span style={{ width: 28, height: 16, background: '#b8f2d0', borderRadius: 4, display: 'inline-block' }}></span>
               <span style={{ fontSize: 13, color: '#888' }}>High</span>
            </div>
         </div>
      </div >
   );
};

export default AllInOneRetentionOverview; 