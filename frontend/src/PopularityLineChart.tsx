import { format } from "date-fns";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface lineChartProps {
    lineData: any;
    song: any;
    artist_name: string;
  }

const PopularityLineChart = ({ lineData, song, artist_name }: lineChartProps) => {
  const formattedLineData = lineData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  const filteredLineData = formattedLineData.filter((_, index) => index % Math.floor(formattedLineData.length / 5) === 0);
  const transformedLineData = filteredLineData.map(item => ({
    ...item,
    value: Math.round(item.value * 1000) / 1000
  }));
  const maxValue = transformedLineData.reduce((max, item) => { return item.value > max ? item.value : max}, -Infinity);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Popularity Trends </h2>
      {song ? <div className="mb-4 text-sm text-gray-600">Showing position in charts over time for the song {song.song_name}, by {song.artist}.</div> :
              <div className="mb-4 text-sm text-gray-600">Showing popularity over time for the artist {artist_name}.</div>}
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={transformedLineData}
            margin={{ top: 10, right: 75, left: 50, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              width={40}
              interval={Math.floor(transformedLineData.length / 5)}
            />
            
            <YAxis 
              dataKey="value"
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              width={40}
              domain={song ? [1, maxValue + 1] : [0, Math.ceil(maxValue)]}
              allowDecimals={song ? false : true}
              reversed={song ? true : false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '0.375rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Line 
              type="linear"
              dataKey="value" 
              name={song ? "position in charts" : "popularity score"}
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
        <div>Last updated: {format(new Date(), "yyyy-MM-dd")}</div>
      </div>
    </div>
  );
};

export default PopularityLineChart;