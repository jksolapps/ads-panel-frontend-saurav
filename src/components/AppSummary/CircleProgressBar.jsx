


const CircleProgressBar = ({ progress = 10, size = 100, trackWidth = 6, indicatorWidth = 6, trackColor = '#ddd', indicatorColor = '#07c' }) => {
   const center = size / 2;
   const radius = center - Math.max(trackWidth, indicatorWidth);
   const circumference = 2 * Math.PI * radius;
   const dashOffset = circumference * ((100 - progress) / 100);

   return (
      <div style={{ width: size, height: size, position: 'relative' }}>
         <svg style={{ width: size, height: size }}>
            {/* Track (background) */}
            <circle
               cx={center}
               cy={center}
               r={radius}
               fill="transparent"
               stroke={trackColor}
               strokeWidth={trackWidth}
            />
            {progress}
            <circle
               cx={center}
               cy={center}
               r={radius}
               fill="transparent"
               stroke={indicatorColor}
               strokeWidth={indicatorWidth}
               strokeLinecap="round"
               strokeDasharray={circumference}
               strokeDashoffset={dashOffset}
               transform={`rotate(-90 ${center} ${center})`}
            />
         </svg>
         <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '16px',
            fontWeight: 'bold',
         }}>
            {progress}%
         </div>
      </div>
   );
};

export default CircleProgressBar